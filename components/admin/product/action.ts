"use server";

import { createClient } from "@/utils/supabase/server";
import slugify from "slugify";

export const createUniqueSlug = async (baseName: string): Promise<string> => {
  const supabase = await createClient();
  const baseSlug = slugify(baseName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    // Check if slug exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    // If no product found with this slug, it's unique
    if (!existingProduct) {
      return slug;
    }

    // If slug exists, add counter and try again
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
