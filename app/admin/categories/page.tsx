import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DataTable } from "@/components/admin/categories/data-table";
import { columns } from "@/components/admin/categories/columns";

export const metadata = {
  title: "Categories",
  description: "Manage your product categories",
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      products: product_categories (
        id
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="flex-1 space-y-4 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Categories"
          description="Manage your product categories"
        />
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Link>
        </Button>
      </div>
      <Separator />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <DataTable columns={columns} data={data || []} />
      </Suspense>
    </div>
  );
}
