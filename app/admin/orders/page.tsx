// app/admin/orders/page.tsx
import { PageHeader } from "@/components/page-header";

import { Separator } from "@/components/ui/separator";

// import { OrdersTable } from "@/components/admin/orders/orders-table";
import { shiprocketRequest } from "@/utils/shiprocket/shiprocket";

export default async function OrdersPage() {
  // const supabase = await createClient();

  // const { data: orders, error } = await supabase
  //   .from("orders")
  //   .select(
  //     `
  //     *,
  //     user:users(email),
  //     shipping_address:addresses!shipping_address_id(*),
  //     order_items(
  //       quantity,
  //       unit_price,
  //       product:products(name)
  //     )
  //   `
  //   )
  //   .order("created_at", { ascending: false });

  // if (error) {
  //   console.error("Error:", error);
  // }

  const res = await shiprocketRequest("/orders", {});
  console.log("res", res);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Orders"
          description="View and manage customer orders"
        />
      </div>

      <Separator />

      {/* <OrdersTable data={orders} /> */}
    </div>
  );
}
