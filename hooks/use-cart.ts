// src/hooks/use-cart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import {
  CartItemWithProductDetails,
  Product,
  ProductVariant,
} from "@/supabase/types";
import { toast } from "sonner";
import { useCartStore } from "@/store/use-cart-store";
import { useEffect } from "react";

// Initialize Supabase client
const supabase = createClient();

const CART_QUERY_KEY = "cart";
const USER_QUERY_KEY = "user";

export function useCart() {
  const queryClient = useQueryClient();

  // Subscribe to auth state changes to invalidate relevant queries
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);

      // Invalidate user and cart queries when auth state changes
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });

      // Reset cart store on signOut
      if (event === "SIGNED_OUT") {
        cartStore.setItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: user } = useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      return user.user;
    },
    staleTime: 0, // Always refetch user data when needed
  });

  console.log("User in useCart:", user?.id);
  console.log("Is Anonymous:", user?.is_anonymous);

  const cartStore = useCartStore();

  // Fetch cart items with Tanstack Query
  const {
    data: cartData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [CART_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return { items: [], summary: { subtotal: 0, itemCount: 0 } };

      try {
        const userId = user.id;
        console.log("Fetching cart for user:", userId);

        // Fetch cart items with product details using a join query
        const { data: cartItems, error } = await supabase
          .from("cart_items")
          .select(
            `
            *,
            product:products(*),
            variant:product_variants(*)
          `
          )
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        // Fetch product images separately for each product
        const productIds = cartItems
          .map((item) => item.product_id)
          .filter((id) => id !== null) as string[];

        const { data: productImagesData } = await supabase
          .from("product_images")
          .select("*")
          .in("product_id", productIds.length ? productIds : [""]);

        const productImagesMap = new Map();
        if (productImagesData) {
          for (const image of productImagesData) {
            if (!productImagesMap.has(image.product_id)) {
              productImagesMap.set(image.product_id, []);
            }
            productImagesMap.get(image.product_id).push(image);
          }
        }

        // Transform the raw data into our CartItemWithProductDetails type
        const formattedItems = cartItems.map((item) => {
          // Cast the raw data to our expected types
          const product = item.product as unknown as Product;
          const variant = item.variant as unknown as ProductVariant | null;

          // Get product images for this product
          const productImages = item.product_id
            ? productImagesMap.get(item.product_id) || []
            : [];

          // Get the first image URL or undefined
          const productImage =
            productImages.length > 0 ? productImages[0].url : undefined;

          // Create properly formatted item
          const formattedItem: CartItemWithProductDetails = {
            ...item,
            product: {
              ...product,
              product_images: productImages,
            },
            variant: variant,
            productImage,
          };

          return formattedItem;
        });

        // Calculate summary
        const summary = {
          subtotal: formattedItems.reduce((total, item) => {
            const price = item.variant?.price || item.product.base_price;
            return total + price * item.quantity;
          }, 0),
          itemCount: formattedItems.reduce(
            (count, item) => count + item.quantity,
            0
          ),
        };

        // Update the Zustand store to keep UI in sync
        cartStore.setItems(formattedItems);

        return { items: formattedItems, summary };
      } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch cart data when needed
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string;
      variantId: string | null;
      quantity: number;
    }) => {
      if (!user) {
        toast.error("Please sign in to add items to cart");
        return false;
      }

      console.log("Adding to cart:", { productId, variantId, quantity }, user);

      const userId = user.id;

      // Check if the item already exists in the cart
      let query = supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId);

      // Handle variant_id appropriately
      if (variantId === null) {
        query = query.is("variant_id", null);
      } else {
        query = query.eq("variant_id", variantId);
      }

      const { data: existingItems, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      if (existingItems && existingItems.length > 0) {
        // Item exists, update quantity
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + quantity;

        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id);

        if (error) {
          throw error;
        }
      } else {
        // Item doesn't exist, insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: userId,
          product_id: productId,
          variant_id: variantId,
          quantity: quantity,
        });

        if (error) {
          throw error;
        }
      }

      return true;
    },
    onMutate: async ({ productId, variantId, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [CART_QUERY_KEY, user?.id],
      });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData([CART_QUERY_KEY, user?.id]);

      // Perform an optimistic update if we have the cart data
      if (cartData) {
        const existingItemIndex = cartData.items.findIndex(
          (item) =>
            item.product_id === productId &&
            ((item.variant_id === null && variantId === null) ||
              item.variant_id === variantId)
        );

        const updatedItems = [...cartData.items];

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };

          // Update the cart store for immediate UI feedback
          cartStore.setItems(updatedItems);
        }
        // For new items, we'll wait for the server response and refetch
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(
          [CART_QUERY_KEY, user?.id],
          context.previousCart
        );
      }
      toast.error("Failed to add item to cart");
    },
    onSuccess: () => {
      toast.success("Item added to cart");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY, user?.id] });
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);

        if (error) {
          throw error;
        }
      } else {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);

        if (error) {
          throw error;
        }
      }

      return true;
    },
    onMutate: async ({ itemId, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY, user?.id] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData([CART_QUERY_KEY, user?.id]);

      // Perform an optimistic update
      if (cartData) {
        let updatedItems;

        if (quantity <= 0) {
          // Remove the item
          updatedItems = cartData.items.filter((item) => item.id !== itemId);
        } else {
          // Update the quantity
          updatedItems = cartData.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
        }

        // Update the cart store for immediate UI feedback
        cartStore.setItems(updatedItems);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(
          [CART_QUERY_KEY, user?.id],
          context.previousCart
        );
      }
      toast.error("Failed to update cart item");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY, user?.id] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        throw error;
      }

      return true;
    },
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY, user?.id] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData([CART_QUERY_KEY, user?.id]);

      // Perform an optimistic update
      if (cartData) {
        const updatedItems = cartData.items.filter(
          (item) => item.id !== itemId
        );

        // Update the cart store for immediate UI feedback
        cartStore.setItems(updatedItems);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(
          [CART_QUERY_KEY, user?.id],
          context.previousCart
        );
      }
      toast.error("Failed to remove item from cart");
    },
    onSuccess: () => {
      toast.success("Item removed from cart");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY, user?.id] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        return false;
      }

      const userId = user.id;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return true;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEY, user?.id] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData([CART_QUERY_KEY, user?.id]);

      // Perform an optimistic update
      cartStore.setItems([]);

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(
          [CART_QUERY_KEY, user?.id],
          context.previousCart
        );
      }
      toast.error("Failed to clear cart");
    },
    onSuccess: () => {
      toast.success("Cart cleared");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY, user?.id] });
    },
  });

  return {
    // Cart data
    cart: cartData || { items: [], summary: { subtotal: 0, itemCount: 0 } },
    isLoading:
      isLoading ||
      addToCartMutation.isPending ||
      updateCartItemMutation.isPending ||
      removeFromCartMutation.isPending ||
      clearCartMutation.isPending,

    // Cart UI state from Zustand store
    isCartOpen: cartStore.isCartOpen,
    openCart: cartStore.openCart,
    closeCart: cartStore.closeCart,
    toggleCart: cartStore.toggleCart,

    // Cart operations using mutations
    addToCart: (
      productId: string,
      variantId: string | null,
      quantity: number
    ) => addToCartMutation.mutate({ productId, variantId, quantity }),
    updateCartItem: (itemId: string, quantity: number) =>
      updateCartItemMutation.mutate({ itemId, quantity }),
    removeFromCart: (itemId: string) => removeFromCartMutation.mutate(itemId),
    clearCart: () => clearCartMutation.mutate(),
    refetch,
  };
}
