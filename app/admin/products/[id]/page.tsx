// app/admin/products/[id]/page.tsx
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";

import { Metadata } from "next";
import { ProductHeader } from "@/components/admin/product/details/product-header";
import { ProductContent } from "@/components/admin/product/details/product-content";
import { Product } from "@/components/admin/product/details/types";

export const metadata: Metadata = {
  title: "Product Details - Admin",
  description: "View and manage product details",
};

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const id = (await params).id;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(
        id,
        url,
        alt_text,
        is_thumbnail,
        sort_order
      ),
      options:product_options_assignments!inner(
        option:product_options(
          id,
          name,
          display_name,
          values:option_values(
            id,
            value,
            display_value
          )
        )
      ),
      variants:product_variants(
        id,
        sku,
        price,
        stock_quantity,
        is_active,
        option_values:variant_option_values(
            id,
          option:product_options(
            name
          ),
          value:option_values(
            value
          )
        )
      ),
      attributes:product_attributes(
        id,
        name,
        value
      ),
      product_categories(
        category:categories(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    return null;
  }

  const updatedProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description || "",
    base_price: product.base_price,
    sale_price: product.sale_price,
    is_active: product.is_active,
    is_featured: product.is_featured,
    category_id: product?.product_categories[0]?.category?.id,
    seo_title: product.seo_title || "",
    seo_description: product.seo_description || "",
    seo_keywords: product.seo_keywords || [],

    // Transform images
    images: product.images.map((img) => ({
      url: img.url,
      alt_text: img.alt_text || "",
      is_thumbnail: img.is_thumbnail,
      sort_order: img.sort_order,
    })),

    // Transform options - note the updated path through option
    options: product.options.map((opt) => ({
      name: opt.option?.name,
      display_name: opt.option?.display_name,
      values: opt.option?.values?.map((val) => ({
        value: val.value,
        display_value: val.display_value,
      })),
    })),

    // Transform variants
    variants: product.variants.map((variant) => {
      // Parse SKU to get option values (format: "We-1kg-Fl-fish")

      const skuParts = variant?.sku?.split("-");

      // Construct option values array
      const optionValues = [];

      // Map Weight option value
      if (skuParts && skuParts[1]) {
        optionValues.push({
          option_id: "Weight",
          value_id: skuParts[1].toLowerCase(),
        });
      }

      // Map Flavor option value
      if (skuParts && skuParts[3]) {
        optionValues.push({
          option_id: "Flavor",
          value_id: skuParts[3].toLowerCase(),
        });
      }

      return {
        sku: variant.sku,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        is_active: variant.is_active,
        option_values: optionValues,
      };
    }),

    // Transform attributes
    attributes: product.attributes.map((attr) => ({
      name: attr.name,
      value: attr.value,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ProductHeader product={updatedProduct as Product} />

      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-7">
          {/* Left column - Main content */}
          <div className="space-y-6 md:col-span-7">
            <Suspense fallback={<div>Loading...</div>}>
              {/* <ProductOverview product={updatedProduct as Product} /> */}
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              <ProductContent product={updatedProduct as Product} />
            </Suspense>
          </div>

          {/* Right column - Additional Info */}
          {/* <div className="md:col-span-2">
            <div className="sticky top-24 space-y-6"></div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
