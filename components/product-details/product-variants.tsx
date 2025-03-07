"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { Product, ProductVariant } from "@/supabase/types";
import { useCart } from "@/hooks/use-cart";

import { motion, AnimatePresence } from "framer-motion";

interface ProductVariantsProps {
  product: Product;
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
}

export function ProductVariants({
  product,
  variants,
  selectedVariantId,
  onVariantSelect,
}: ProductVariantsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, openCart } = useCart();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(Math.min(value, selectedVariant?.stock_quantity || 999));
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;

    setIsAddingToCart(true);

    try {
      // Add item to cart
      addToCart(product.id, selectedVariant.id, quantity);

      // Show "Added to Cart" for 1.5 seconds, then reset
      setTimeout(() => {
        setIsAddingToCart(false);
        openCart(); // Open cart sheet after adding item
      }, 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="variant-select">
          Select Variant
        </label>
        <Select value={selectedVariantId || ""} onValueChange={onVariantSelect}>
          <SelectTrigger id="variant-select">
            <SelectValue placeholder="Choose a variant" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem
                key={variant.id}
                value={variant.id}
                disabled={!variant.is_active || variant.stock_quantity === 0}
              >
                {variant.sku || `Variant ${variant.id}`} - ₹
                {variant.price.toLocaleString()}
                {variant.stock_quantity === 0 && " (Out of Stock)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!selectedVariant || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min="1"
            max={selectedVariant?.stock_quantity || 999}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-20 text-center"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={
              !selectedVariant ||
              quantity >= (selectedVariant?.stock_quantity || 999)
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        className="w-full relative overflow-hidden"
        size="lg"
        onClick={handleAddToCart}
        disabled={!selectedVariant || isAddingToCart}
      >
        <AnimatePresence initial={false} mode="wait">
          {isAddingToCart ? (
            <motion.div
              key="added"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Check className="mr-2 h-4 w-4" />
              Added to Cart
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Stock Information */}
      {selectedVariant && (
        <div className="text-sm">
          {selectedVariant.stock_quantity > 0 ? (
            <p className="text-green-600">
              In Stock
              {selectedVariant.stock_quantity < 10 &&
                ` (Only ${selectedVariant.stock_quantity} left)`}
            </p>
          ) : (
            <p className="text-red-500">Out of Stock</p>
          )}
          {selectedVariant.sku && (
            <p className="text-muted-foreground">SKU: {selectedVariant.sku}</p>
          )}
        </div>
      )}
    </div>
  );
}
