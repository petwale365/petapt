import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { columns, Product } from "@/components/admin/product/columns";

const ProductsPage = async () => {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
    *,
    categories(id, name),
    product_variants(*), 
    product_images(*)
  `
    )
    .order("created_at", { ascending: false });

  console.log("products", products);

  return (
    <div className="flex-1 space-y-4 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button asChild>
          <Link href="/admin/products/new">Add New</Link>
        </Button>
      </div>
      <Separator />

      <DataTable columns={columns} data={products as Product[]} />
    </div>
  );
};

export default ProductsPage;
