// components/admin/products/types.ts
import * as z from "zod";

// Base TypeScript interfaces
export interface OptionValue {
  value: string;
  display_value: string;
}

export interface ProductOption {
  name: string;
  display_name: string;
  values: OptionValue[];
}

export interface ProductAttribute {
  name: string;
  display_name: string;
  value: string;
}

export interface VariantOptionValue {
  option_id: string;
  value_id: string;
}

export interface ProductVariant {
  sku: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  option_values: VariantOptionValue[];
}

// Zod schemas that match the TypeScript interfaces
export const optionValueSchema = z.object({
  value: z.string(),
  display_value: z.string(),
});

export const productOptionSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  values: z.array(optionValueSchema),
});

export const variantOptionValueSchema = z.object({
  option_id: z.string(),
  value_id: z.string(),
});

export const productVariantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0),
  stock_quantity: z.number().min(0),
  is_active: z.boolean(),
  option_values: z.array(variantOptionValueSchema),
});

// Main product schema
export const productSchema = z.object({
  // Step 1: Basic Details
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0, "Price must be greater than 0"),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  category_id: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),

  // Step 2: Media
  images: z
    .array(
      z.object({
        url: z.string(),
        alt_text: z.string().optional(),
        is_thumbnail: z.boolean(),
        sort_order: z.number(),
      })
    )
    .default([]),

  // Step 3: Variants
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),

  // Step 4: Attributes
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .default([]),

  // Step 4: SEO
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.array(z.string()).default([]),
});

// Derived types from the schema
export type ProductImage = z.infer<typeof productSchema>["images"][number];

// Update ProductFormData interface if needed
export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductWithRelations {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  sale_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  created_at: string;

  // Relations
  images: Array<{
    id: string;
    url: string;
    alt_text: string | null;
    is_thumbnail: boolean;
    sort_order: number;
  }>;

  options: Array<{
    option: {
      id: string;
      name: string;
      display_name: string;
      values: Array<{
        id: string;
        value: string;
        display_value: string;
      }>;
    };
  }>;

  variants: Array<{
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    option_values: Array<{
      id: string;
      option: {
        name: string;
      };
      value: {
        value: string;
      };
    }>;
  }>;

  attributes: Array<{
    id: string;
    name: string;
    value: string;
  }>;

  product_categories: Array<{
    category_id: string;
  }>;
}
