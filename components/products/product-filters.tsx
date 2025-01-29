"use client";
import React from "react";
import { useQueryState } from "nuqs";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/supabase/types";

interface ProductFiltersProps {
  categories: Category[];
  maxPrice: number;
}

export const ProductFilters = ({
  categories,
  maxPrice,
}: ProductFiltersProps) => {
  const [selectedCategories, setSelectedCategories] =
    useQueryState("categories");
  const [priceRange, setPriceRange] = useQueryState("price");
  console.log(priceRange);
  const [sort, setSort] = useQueryState("sort");

  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = selectedCategories
      ? selectedCategories.split(",")
      : [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    setSelectedCategories(
      newCategories.length > 0 ? newCategories.join(",") : null
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value.join("-"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-64 space-y-4"
    >
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={sort || ""}
          onValueChange={(value) => setSort(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.slug}
                    checked={selectedCategories?.includes(category.slug)}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                  />
                  <Label htmlFor={category.slug}>{category.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2">
              <Slider
                defaultValue={[0, maxPrice]}
                max={maxPrice}
                step={100}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>₹0</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};
