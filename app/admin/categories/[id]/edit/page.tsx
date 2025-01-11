// src/app/admin/categories/[id]/page.tsx
import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import CategoryForm from "@/components/admin/categories/category-form";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/page-header";

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: CategoryPageProps) {
  const id = await params;
  const supabase = await createClient();

  // Fetch the category and all categories for parent selection
  const [{ data: category, error }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).single(),
  ]);

  if (error || !category) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Category"
          description={`Edit category "${category.name}"`}
        />
      </div>
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryForm initialData={category} />
      </Suspense>
    </div>
  );
}
