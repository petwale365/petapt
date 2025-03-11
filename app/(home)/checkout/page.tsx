// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/hooks/use-cart";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AddressFormDialog from "@/components/checkout/address-form-dialog";
import AddressSelection from "@/components/checkout/address-selection";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import SimpleCaptcha from "@/components/checkout/simple-captcha";
import { createStoreURL } from "@/lib/utils";
import { Address } from "@/supabase/types";

export default function CheckoutPage() {
  const { user, isAnonymous, isReady } = useUser();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Redirect anonymous users to login
  useEffect(() => {
    if (isReady && isAnonymous) {
      // Create a URL with redirectTo parameter to come back to checkout
      const loginUrl = createStoreURL("/login", {
        redirectTo: "/checkout",
      });

      toast.info("Please log in to continue with checkout");
      router.push(loginUrl);
    }
  }, [isReady, isAnonymous, router]);

  // Load user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user || isAnonymous) return;

      try {
        setIsLoadingAddresses(true);
        const { data: addressData, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (error) throw error;

        setAddresses(addressData || []);

        // Set default address if available
        const defaultAddress = addressData?.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressData && addressData.length > 0) {
          setSelectedAddressId(addressData[0].id);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load your saved addresses");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user, isAnonymous, supabase]);

  // Handle captcha verification
  const handleCaptchaVerify = (isVerified: boolean) => {
    setIsCaptchaVerified(isVerified);
    if (isVerified) {
      toast.success("Captcha verification successful!");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isCaptchaVerified) {
      toast.error("Please complete the captcha verification");
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Create the order using RPC function
      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_order",
        {
          p_user_id: user!.id,
          p_order_number: orderNumber,
          p_shipping_address_id: selectedAddressId,
          p_billing_address_id: selectedAddressId, // Using same address for both
          p_subtotal: cart.summary.subtotal,
          p_total_amount: cart.summary.subtotal, // No shipping fee for now
          p_payment_method: "cod",
          p_payment_status: "pending",
          p_status: "new",
        }
      );

      if (orderError) throw orderError;

      // Add order items one by one using RPC
      for (const item of cart.items) {
        const { error: itemError } = await supabase.rpc("add_order_item", {
          p_order_id: orderId,
          p_product_id: item.product_id!,
          p_variant_id: item.variant_id!,
          p_quantity: item.quantity,
          p_unit_price: item.variant?.price || item.product.base_price,
          p_total_price:
            (item.variant?.price || item.product.base_price) * item.quantity,
        });

        if (itemError) throw itemError;
      }

      // Clear cart after successful order
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user!.id);

      if (clearCartError) {
        console.error("Error clearing cart:", clearCartError);
        // Continue anyway since the order was created
      } else {
        // Refresh cart in store
        clearCart();
      }

      toast.success("Order placed successfully!");

      // Redirect to order confirmation
      router.push(`/orders/${orderId}/confirmation`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place your order. Please try again.");
      // Reset captcha verification status
      setIsCaptchaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if not ready or checking anonymous status
  if (!isReady || (isReady && isAnonymous)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>
        <p className="mt-2 text-lg text-gray-600">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-12">
        {/* Left side - Delivery details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-medium mb-4">Delivery Address</h2>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="space-y-4">
                <AddressSelection
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                />

                <Button
                  variant="outline"
                  onClick={() => setIsAddressDialogOpen(true)}
                  className="mt-4"
                >
                  Add New Address
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You don&apos;t have any saved addresses yet
                </p>
                <Button onClick={() => setIsAddressDialogOpen(true)}>
                  Add New Address
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-medium mb-4">Payment Method</h2>
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="flex items-center space-x-3">
                <input
                  id="cod"
                  name="payment-method"
                  type="radio"
                  className="h-5 w-5 text-primary"
                  checked={true}
                  readOnly
                />
                <label
                  htmlFor="cod"
                  className="text-base font-medium text-gray-900"
                >
                  Cash on Delivery (COD)
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500 ml-8">
                Pay when your order is delivered
              </p>
            </div>
          </div>

          {/* Simple Captcha verification */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-medium mb-4">Security Verification</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please complete the verification below to confirm you&apos;re not
              a robot
            </p>
            <SimpleCaptcha onVerify={handleCaptchaVerify} />
          </div>
        </div>

        {/* Right side - Order summary */}
        <div className="lg:col-span-1">
          <CheckoutSummary
            onPlaceOrder={handlePlaceOrder}
            isLoading={isLoading}
            hasAddress={!!selectedAddressId}
            isRecaptchaVerified={isCaptchaVerified}
          />
        </div>
      </div>

      {/* Address form dialog */}
      <AddressFormDialog
        open={isAddressDialogOpen}
        onClose={() => setIsAddressDialogOpen(false)}
        onAddressCreated={(newAddress) => {
          setAddresses((prev) => [newAddress, ...prev]);
          setSelectedAddressId(newAddress.id);
          setIsAddressDialogOpen(false);
        }}
      />
    </div>
  );
}
