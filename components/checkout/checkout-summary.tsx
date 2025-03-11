// app/checkout/components/checkout-summary.tsx
"use client";

import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import Link from "next/link";

interface CheckoutSummaryProps {
  onPlaceOrder: () => void;
  isLoading: boolean;
  hasAddress: boolean;
  isRecaptchaVerified?: boolean; // Keep the same prop name for compatibility
}

export default function CheckoutSummary({
  onPlaceOrder,
  isLoading,
  hasAddress,
  isRecaptchaVerified = false,
}: CheckoutSummaryProps) {
  const { cart, updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-24">
      <div className="p-6">
        <h2 className="text-xl font-medium mb-4">Order Summary</h2>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Your cart is empty
            </p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto pr-2 space-y-4 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex space-x-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.product.name}
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
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3 className="text-sm">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium hover:underline"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="ml-4 text-sm font-semibold">
                        ₹
                        {(
                          (item.variant?.price || item.product.base_price) *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>

                    {item.variant && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        SKU: {item.variant.sku || "N/A"}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={
                            isLoading ||
                            (item.variant?.stock_quantity
                              ? item.quantity >= item.variant.stock_quantity
                              : false)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">
                  ₹{cart.summary.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="font-medium">Free</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span className="font-medium">{cart.summary.itemCount}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">
                  ₹{cart.summary.subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={onPlaceOrder}
              className="w-full mt-6"
              size="lg"
              disabled={
                isLoading ||
                cart.items.length === 0 ||
                !hasAddress ||
                !isRecaptchaVerified
              }
            >
              {isLoading ? "Processing..." : "Place Order"}
            </Button>

            {!hasAddress && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Please select a delivery address
              </p>
            )}

            {!isRecaptchaVerified && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Please complete the captcha verification
              </p>
            )}

            <p className="text-xs text-center text-muted-foreground mt-4">
              By placing this order, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </>
        )}
      </div>
    </div>
  );
}
