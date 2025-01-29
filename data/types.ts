interface ProductImage {
  url: string;
  alt_text: string;
  is_thumbnail: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: ProductImage[];
  base_price: number;
  sale_price: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string | null;
  created_at: string;
  metadata?: unknown | null;
  products?: Product[];
}

export type { Category, Product, ProductImage };
