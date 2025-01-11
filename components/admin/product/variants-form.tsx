"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ProductFormData,
  ProductOption,
  ProductVariant,
  VariantOptionValue,
} from "./types";

interface VariantsFormProps {
  form: UseFormReturn<ProductFormData>;
}

interface OptionInput {
  name: string;
  values: string;
}

export function VariantsForm({ form }: VariantsFormProps) {
  // Form state
  const [optionInput, setOptionInput] = useState<OptionInput>({
    name: "",
    values: "",
  });

  // Watch form values
  const options = form.watch("options") || [];
  const variants = form.watch("variants") || [];
  const basePrice = form.watch("base_price") || 0;

  // Add new option with multiple values
  const handleAddOption = (): void => {
    if (!optionInput.name || !optionInput.values.trim()) return;

    // Split and clean values
    const values = optionInput.values
      .split(/[,\n]/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({
        value: value.toLowerCase(),
        display_value: value,
      }));

    if (values.length === 0) return;

    // Create new option
    const newOption: ProductOption = {
      name: optionInput.name,
      display_name: optionInput.name,
      values,
    };

    const updatedOptions = [...options, newOption];
    form.setValue("options", updatedOptions);
    generateVariants(updatedOptions);
    setOptionInput({ name: "", values: "" });
  };

  // Remove an entire option
  const handleRemoveOption = (optionName: string): void => {
    const updatedOptions = options.filter((opt) => opt.name !== optionName);
    form.setValue("options", updatedOptions);
    generateVariants(updatedOptions);
  };

  // Generate all possible variants
  const generateVariants = (currentOptions: ProductOption[]): void => {
    if (currentOptions.length === 0) {
      form.setValue("variants", []);
      return;
    }

    const combinations = getCombinations(currentOptions);
    const newVariants: ProductVariant[] = combinations.map((combination) => {
      const sku = generateSKU(combination);

      // Find existing variant
      const existingVariant = variants.find(
        (v) => JSON.stringify(v.option_values) === JSON.stringify(combination)
      );

      return {
        sku,
        price: existingVariant?.price || basePrice,
        stock_quantity: existingVariant?.stock_quantity || 0,
        is_active: existingVariant?.is_active ?? true,
        option_values: combination, // This is now an array of VariantOptionValue
      };
    });

    form.setValue("variants", newVariants);
  };

  // Update variant field
  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | boolean | number
  ): void => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    form.setValue("variants", newVariants);
  };

  // Generate SKU from variant combination
  const generateSKU = (combination: VariantOptionValue[]): string => {
    return combination
      .map((c) => `${c.option_id.substring(0, 2)}-${c.value_id}`)
      .join("-");
  };

  return (
    <div className="space-y-6">
      {/* Option Builder */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add Product Options</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Option Name</Label>
            <Input
              placeholder="e.g., Weight, Size, Color"
              value={optionInput.name}
              onChange={(e) =>
                setOptionInput((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Option Values</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 1.5kg, 1kg, 6kg"
                value={optionInput.values}
                onChange={(e) =>
                  setOptionInput((prev) => ({
                    ...prev,
                    values: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddOption}
                className="shrink-0"
                disabled={!optionInput.name || !optionInput.values.trim()}
              >
                Add
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Separate values with commas or press Enter to add
            </p>
          </div>
        </div>
      </div>

      {/* Current Options */}
      {options.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Options</h3>
          <div className="divide-y rounded-md border">
            {options.map((option) => (
              <div key={option.name} className="p-4">
                <div className="flex items-center justify-between">
                  <Label>{option.name}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(option.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <Badge key={value.value} variant="secondary">
                      {value.display_value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Product Variants ({variants.length})
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Options</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[150px]">Price</TableHead>
                  <TableHead className="w-[150px]">Stock</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={variant.sku}>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {variant.option_values.map((ov, i) => {
                          const option = options.find(
                            (o) => o.name === ov.option_id
                          );
                          const value = option?.values.find(
                            (v) => v.value === ov.value_id
                          );
                          return (
                            <Badge
                              key={i}
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {value?.display_value}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-muted-foreground">
                        {variant.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, "price", Number(e.target.value))
                        }
                        className="h-8 w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock_quantity",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={variant.is_active}
                        onCheckedChange={(checked) =>
                          updateVariant(index, "is_active", checked)
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get all possible combinations
function getCombinations(options: ProductOption[]): VariantOptionValue[][] {
  const optionValues = options.map((option) =>
    option.values.map((value) => ({
      option_id: option.name,
      value_id: value.value,
    }))
  );

  return optionValues.reduce<VariantOptionValue[][]>((acc, curr) => {
    if (acc.length === 0) return curr.map((value) => [value]);
    return acc.flatMap((combination) =>
      curr.map((value) => [...combination, value])
    );
  }, []);
}
