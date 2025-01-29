// app/admin/users/page.tsx
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

import { columns, UserColumn } from "@/components/admin/users/columns";
import { DataTable } from "@/components/admin/users/data-table";

export const metadata = {
  title: "Users",
  description: "Manage your users and their roles",
};

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select(
      `
      *,
      addresses (
        id,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default,
        type
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
          title="Users"
          description="Manage your users and their roles"
        />
      </div>
      <Separator />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        }
      >
        <DataTable columns={columns} data={users as unknown as UserColumn[]} />
      </Suspense>
    </div>
  );
}
