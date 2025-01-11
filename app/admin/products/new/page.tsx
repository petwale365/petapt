// app/admin/products/new/page.tsx
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/admin/product/product-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Product - Petapt",
  description: "Create a new product for your store",
};

export default async function NewProductPage() {
  const supabase = await createClient();

  // Fetch all necessary data in parallel
  const [{ data: categories }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!categories) {
    throw new Error("Failed to load required data");
  }

  return (
    <div className="flex-1 space-y-8 md:space-y-20 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Create Product"
          description="Add a new product to your store"
        />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductForm categories={categories} />
      </Suspense>
    </div>
  );
}
