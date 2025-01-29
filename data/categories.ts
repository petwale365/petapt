"use server";
import { createClient } from "@/utils/supabase/server";

import { cache } from "react";

export const getCategoriesList = cache(async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
  }
});

export const getProductsByCategorySlug = cache(async (slug: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products (
          id,
          name,
          slug,
          base_price,
          sale_price,
          images:product_images (
            url,
            is_thumbnail,
            alt_text
          )
        )

        `
      )
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
  }
});
