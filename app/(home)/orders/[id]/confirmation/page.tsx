"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { Address, Order, OrderItem, ProductImage } from "@/supabase/types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAnonymous, isReady } = useUser();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [productImages, setProductImages] = useState<
    Record<string, ProductImage[]>
  >({});

  const orderId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  useEffect(() => {
    if (isReady && isAnonymous) {
      toast.error("You need to be logged in to view orders");
      router.push("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single();

        if (orderError) throw orderError;
        if (!orderData) {
          toast.error("Order not found");
          router.push("/");
          return;
        }

        setOrder(orderData as Order);

        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select(
            `
            *,
            product:products(*),
            variant:product_variants(*)
          `
          )
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;

        // Type assertion for the order items
        const typedItems = itemsData as unknown as OrderItem[];
        setOrderItems(typedItems || []);

        // Get all product IDs to fetch images
        const productIds = typedItems
          .map((item) => item.product_id)
          .filter((id): id is string => !!id);

        if (productIds.length > 0) {
          // Fetch product images
          const { data: imagesData, error: imagesError } = await supabase
            .from("product_images")
            .select("*")
            .in("product_id", productIds);

          if (imagesError) throw imagesError;

          // Group images by product ID
          const imagesByProduct: Record<string, ProductImage[]> = {};
          (imagesData || []).forEach((image) => {
            if (image.product_id) {
              if (!imagesByProduct[image.product_id]) {
                imagesByProduct[image.product_id] = [];
              }
              imagesByProduct[image.product_id].push(image as ProductImage);
            }
          });

          setProductImages(imagesByProduct);
        }

        // Fetch shipping address
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", orderData.shipping_address_id)
          .single();

        if (addressError) throw addressError;
        setAddress(addressData as Address);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrderDetails();
    }
  }, [user, isReady, isAnonymous, orderId, router, supabase]);

  if (isLoading || !order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Helper function to get product image URL
  const getProductImageUrl = (productId: string | null): string | undefined => {
    if (
      !productId ||
      !productImages[productId] ||
      productImages[productId].length === 0
    ) {
      return undefined;
    }
    return productImages[productId][0].url;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-500">
            Thank you for your order. We&apos;ve received your request and are
            processing it.
          </p>
          <div className="mt-4 text-sm bg-gray-50 px-4 py-2 rounded-full">
            Order #{order.order_number}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Order Status</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {String(order.status).charAt(0).toUpperCase() +
                    String(order.status).slice(1)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="relative">
              <div className="mt-2 grid grid-cols-4 gap-4">
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      order.status !== "cancelled"
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  >
                    <ShoppingBag
                      className={`h-5 w-5 ${
                        order.status !== "cancelled"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Ordered</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      order.created_at || new Date()
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ["processing", "shipped", "delivered"].includes(
                        String(order.status)
                      )
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  >
                    <Package
                      className={`h-5 w-5 ${
                        ["processing", "shipped", "delivered"].includes(
                          String(order.status)
                        )
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Processing</div>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ["shipped", "delivered"].includes(String(order.status))
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  >
                    <Truck
                      className={`h-5 w-5 ${
                        ["shipped", "delivered"].includes(String(order.status))
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Shipped</div>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      order.status === "delivered"
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        order.status === "delivered"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium">Delivered</div>
                </div>
              </div>

              <div className="absolute top-5 left-0 right-0 mx-auto h-0.5 w-3/4">
                <div
                  className={`h-full ${
                    order.status === "new"
                      ? "w-0"
                      : order.status === "processing"
                      ? "w-1/3"
                      : order.status === "shipped"
                      ? "w-2/3"
                      : order.status === "delivered"
                      ? "w-full"
                      : "w-0"
                  } bg-primary transition-all duration-500`}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span>
                    {new Date(
                      order.created_at || new Date()
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="capitalize">{order.payment_status}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Shipping</span>
                  <span>
                    {order.shipping_fee
                      ? `₹${order.shipping_fee.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Shipping Details</h3>

              {address && (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="font-medium">
                    {address.first_name} {address.last_name}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                    <p className="font-medium">Phone: {address.phone}</p>
                  </div>
                </div>
              )}

              {order.tracking_number && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Tracking Number</span>
                    </div>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.tracking_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Order Items</h3>

            <div className="rounded-lg border divide-y">
              {orderItems.map((item) => (
                <div key={item.id} className="p-4 flex space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    {getProductImageUrl(item.product_id) ? (
                      <Image
                        src={getProductImageUrl(item.product_id) || ""}
                        alt={item.product?.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.product?.name || "Product"}
                        </h4>
                        {item.variant && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            SKU: {item.variant.sku || "N/A"}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        ₹{item.unit_price.toLocaleString()} x {item.quantity}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
                      <div className="text-sm font-semibold">
                        ₹{item.total_price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            <Button asChild variant="outline">
              <Link href="/orders" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>

            <Button asChild>
              <Link href="/products" className="flex items-center">
                Continue Shopping
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
