"use server";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export const getCollectionList = cache(async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("collections").select("*");
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
});

export const getProductsByCollectionSlug = cache(async (slug: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
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

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
  }
});
