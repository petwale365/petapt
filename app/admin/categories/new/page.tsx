// src/app/admin/categories/new/page.tsx
import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";

import { PageHeader } from "@/components/page-header";
import CategoryForm from "@/components/admin/categories/category-form";

export const metadata = {
  title: "New Category",
  description: "Create a new product category",
};

export default async function CreateNewCategoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Create Category"
          description="Create a new product category"
        />
      </div>
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryForm />
      </Suspense>
    </div>
  );
}
