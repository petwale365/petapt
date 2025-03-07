"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CartSheet() {
  const router = useRouter();
  const {
    cart,
    isLoading,
    isCartOpen,
    closeCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle>Your Cart</SheetTitle>
            <SheetClose className="rounded-full border p-1 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <div className="text-xl font-medium">Your cart is empty</div>
            <p className="text-center text-muted-foreground">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button onClick={closeCart} asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium hover:underline"
                          onClick={closeCart}
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.variant.sku || "N/A"}
                          </p>
                        )}
                        <p className="text-sm font-semibold">
                          ₹
                          {(
                            (item.variant?.price || item.product.base_price) *
                            item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
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
                            className="h-7 w-7"
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
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
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
            </div>

            <div className="mt-6 space-y-4">
              <Separator />

              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">
                  ₹{cart.summary.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span className="font-medium">{cart.summary.itemCount}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">
                  ₹{cart.summary.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="w-full"
                  disabled={isLoading}
                >
                  Clear Cart
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground mt-4">
                Shipping and taxes calculated at checkout
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
