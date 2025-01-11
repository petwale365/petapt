// types/product.ts
export interface ProductImage {
  url: string;
  alt_text: string;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface OptionValue {
  value: string;
  display_value: string;
}

export interface ProductOption {
  name: string;
  display_name: string;
  values: OptionValue[];
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

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  sale_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
}
