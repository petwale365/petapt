"use server";

import { createClient } from "@/utils/supabase/server";
import { Product } from "@/components/product-details/types";

export async function getProductsBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
        *,
        product_images (*),
        product_variants (
          *,
          variant_option_values (
            option_id,
            option_value_id,
            product_options (*),
            option_values (*)
          )
        ),
        product_categories (
          id,
          product_id,
          category:categories (
            id,
            name,
            slug,
            description,
            image_url,
            is_active
          )
        ),
        product_collections (
          id,
          product_id,
          collection:collections (
            id,
            name,
            slug,
            description,
            image_url,
            is_active
          )
        )
      `
    )
    .eq("slug", slug)
    .single();
  return products;
}
