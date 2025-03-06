/*eslint-disable @typescript-eslint/no-explicit-any */

// Base types
export interface Image {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  mime_type: string | null;
  created_at: string;
  product_id: string;
  sort_order: number;
  variant_id: string | null;
  is_thumbnail: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  price: number;
  weight: number | null;
  barcode: string | null;
  is_active: boolean;
  created_at: string;
  is_default: boolean;
  product_id: string;
  updated_at: string;
  stock_quantity: number;
  low_stock_alert: number;
  compare_at_price: number | null;
  variant_option_values: {
    option_id: string;
    option_value_id: string;
    product_options: {
      id: string;
      name: string;
      display_name: string;
    };
    option_values: {
      id: string;
      value: string;
      display_value: string;
    };
  }[];
}

// Junction table types
export interface ProductCategory {
  id: string;
  category: Category;
  product_id: string;
}

export interface ProductCollection {
  id: string;
  product_id: string;
  collection: Collection;
}

// Main product type
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  sale_price: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  created_at: string;
  updated_at: string;
  metadata: any | null;
  product_images: Image[];
  product_variants: ProductVariant[];
  product_categories: ProductCategory[];
  product_collections: ProductCollection[];
}

// Props interface for the ProductDetails component
export interface ProductDetailsProps {
  product: Product;
}
