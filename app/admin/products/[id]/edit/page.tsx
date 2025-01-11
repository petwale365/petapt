// app/admin/products/[id]/edit/page.tsx
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/admin/product/product-form";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import type {
  ProductFormData,
  ProductWithRelations,
} from "@/components/admin/product/types";

export const metadata: Metadata = {
  title: "Edit Product - Admin",
  description: "Edit your product details",
};

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const id = (await params).id;
  const supabase = await createClient();

  // Fetch all necessary data in parallel
  const [productResponse, categoriesResponse] = await Promise.all([
    // Fetch product with all its relationships
    supabase
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
        category_id
      )
    `
      )
      .eq("id", id)
      .single(),

    // Fetch categories
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (productResponse.error || categoriesResponse.error) {
    console.error("Error fetching data:", {
      product: productResponse.error,
      categories: categoriesResponse.error,
    });
    notFound();
  }

  const product = productResponse.data as unknown as ProductWithRelations;
  const categories = categoriesResponse.data;

  if (!product || !categories) {
    notFound();
  }

  // Transform the data to match our form structure
  const initialData: ProductFormData = {
    name: product.name,
    description: product.description || "",
    base_price: product.base_price,
    sale_price: product.sale_price,
    is_active: product.is_active,
    is_featured: product.is_featured,
    category_id: product.product_categories[0]?.category_id,
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
      name: opt.option.name,
      display_name: opt.option.display_name,
      values: opt.option.values.map((val) => ({
        value: val.value,
        display_value: val.display_value,
      })),
    })),

    // Transform variants
    variants: product.variants.map((variant) => {
      // Parse SKU to get option values (format: "We-1kg-Fl-fish")
      const skuParts = variant.sku.split("-");

      // Construct option values array
      const optionValues = [];

      // Map Weight option value
      if (skuParts[1]) {
        optionValues.push({
          option_id: "Weight",
          value_id: skuParts[1].toLowerCase(),
        });
      }

      // Map Flavor option value
      if (skuParts[3]) {
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
    <div className="flex-1 space-y-8 md:space-y-20 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Product"
          description={`Editing ${product.name}`}
        />
      </div>

      <Separator />

      <Suspense fallback={<div>Loading...</div>}>
        <ProductForm
          categories={categories}
          initialData={initialData}
          isEditing
          productId={product.id}
        />
      </Suspense>
    </div>
  );
}
