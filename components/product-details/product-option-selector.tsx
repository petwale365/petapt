"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface OptionValue {
  id: string;
  value: string;
  display_value: string;
  option_id: string;
}

interface Option {
  id: string;
  name: string;
  display_name: string;
  values: OptionValue[];
}

interface ProductVariant {
  id: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  sku: string | null;
  variant_option_values: Array<{
    option_id: string;
    option_value_id: string;
  }>;
}

interface ProductOptionsSelectorProps {
  product: any;
  variants: ProductVariant[];
  onVariantSelect: (variantId: string) => void;
}

export function ProductOptionsSelector({
  product,
  variants,
  onVariantSelect,
}: ProductOptionsSelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const { addToCart, openCart } = useCart();

  // Extract product options and their values
  const options: Option[] = [];
  const optionSet = new Set<string>();

  // First, identify all available options
  variants.forEach((variant) => {
    variant.variant_option_values?.forEach((optionValue) => {
      if (optionValue.option_id) {
        optionSet.add(optionValue.option_id);
      }
    });
  });

  // For each option, collect all possible values
  optionSet.forEach((optionId) => {
    // Find any variant that has this option to get the option name
    const variantWithOption = variants.find((v) =>
      v.variant_option_values?.some((ov) => ov.option_id === optionId)
    );

    if (variantWithOption) {
      const optionValueObj = variantWithOption.variant_option_values.find(
        (ov) => ov.option_id === optionId
      );

      if (optionValueObj && optionValueObj.product_options) {
        // Get all unique values for this option
        const values: OptionValue[] = [];
        const valueSet = new Set<string>();

        variants.forEach((variant) => {
          const optValue = variant.variant_option_values?.find(
            (ov) => ov.option_id === optionId
          );

          if (
            optValue &&
            optValue.option_value_id &&
            !valueSet.has(optValue.option_value_id)
          ) {
            valueSet.add(optValue.option_value_id);
            if (optValue.option_values) {
              values.push({
                id: optValue.option_value_id,
                value: optValue.option_values.value,
                display_value: optValue.option_values.display_value,
                option_id: optionId,
              });
            }
          }
        });

        options.push({
          id: optionId,
          name: optionValueObj.product_options.name,
          display_name: optionValueObj.product_options.display_name,
          values,
        });
      }
    }
  });

  // Find variant based on selected options
  useEffect(() => {
    const selectedOptionKeys = Object.keys(selectedOptions);

    // Only try to find a variant if all options have been selected
    if (selectedOptionKeys.length === options.length) {
      const matchingVariant = variants.find((variant) => {
        // Check if this variant matches all selected options
        return selectedOptionKeys.every((optionId) => {
          const selectedValueId = selectedOptions[optionId];
          return variant.variant_option_values?.some(
            (ov) =>
              ov.option_id === optionId &&
              ov.option_value_id === selectedValueId
          );
        });
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        onVariantSelect(matchingVariant.id);
      } else {
        setSelectedVariant(null);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedOptions, variants, options.length, onVariantSelect]);

  // Initialize with first available values if variants exist
  useEffect(() => {
    if (variants.length > 0 && options.length > 0) {
      const initialOptions: Record<string, string> = {};

      // Select first available value for each option
      options.forEach((option) => {
        if (option.values.length > 0) {
          initialOptions[option.id] = option.values[0].id;
        }
      });

      setSelectedOptions(initialOptions);
    }
  }, [variants, options]);

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

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

  // Check if an option value is available (part of an in-stock variant)
  const isOptionValueAvailable = (
    optionId: string,
    valueId: string
  ): boolean => {
    // Create a set of current selections excluding the one we're checking
    const currentSelections = { ...selectedOptions };
    delete currentSelections[optionId];

    // Check if any variant with this value and current other selections is available
    return variants.some((variant) => {
      // Must have this option value
      const hasThisValue = variant.variant_option_values?.some(
        (ov) => ov.option_id === optionId && ov.option_value_id === valueId
      );

      if (!hasThisValue) return false;

      // Must match other selected options
      const matchesOtherSelections = Object.entries(currentSelections).every(
        ([otherOptionId, otherValueId]) =>
          variant.variant_option_values?.some(
            (ov) =>
              ov.option_id === otherOptionId &&
              ov.option_value_id === otherValueId
          )
      );

      // Must be in stock and active
      const isAvailable = variant.is_active && variant.stock_quantity > 0;

      return hasThisValue && matchesOtherSelections && isAvailable;
    });
  };

  return (
    <div className="space-y-6">
      {/* Options Selection */}
      {options.map((option) => (
        <div key={option.id} className="space-y-3">
          <h3 className="font-medium">{option.display_name}</h3>

          <RadioGroup
            value={selectedOptions[option.id] || ""}
            onValueChange={(value) => handleOptionChange(option.id, value)}
            className="flex flex-wrap gap-2"
          >
            {option.values.map((value) => {
              const isAvailable = isOptionValueAvailable(option.id, value.id);
              return (
                <div key={value.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={value.id}
                    id={`${option.id}-${value.id}`}
                    disabled={!isAvailable}
                    className={!isAvailable ? "opacity-50" : ""}
                  />
                  <Label
                    htmlFor={`${option.id}-${value.id}`}
                    className={
                      !isAvailable
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    {value.display_value}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}

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

      {/* Price display */}
      {selectedVariant && (
        <div className="text-lg font-medium">
          Price: ₹{selectedVariant.price.toLocaleString()}
          {selectedVariant.compare_at_price && (
            <span className="ml-2 text-muted-foreground line-through">
              ₹{selectedVariant.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        className="w-full relative overflow-hidden"
        size="lg"
        onClick={handleAddToCart}
        disabled={
          !selectedVariant ||
          isAddingToCart ||
          (selectedVariant && selectedVariant.stock_quantity <= 0)
        }
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
