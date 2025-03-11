import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Order } from "@/components/admin/orders/columns";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { fetchOrdersWithRelations } from "@/data/orders";
import { shiprocketRequest } from "@/utils/shiprocket/shiprocket";

export default async function OrdersPage() {
  const res = await shiprocketRequest("/orders", {});
  console.log("res", res);
  const { data: orders, error } = await fetchOrdersWithRelations({
    limit: 10,
    page: 1,
    orderBy: "created_at",
    ascending: false,
  });

  if (error) {
    console.error("Error fetching orders:", error);
    return <div>Error loading orders</div>;
  }
  // Format orders for the table
  const formattedOrders = orders?.map((order) => ({
    ...order,
    user: order.user_id || { email: "Unknown", full_name: "Unknown" },
    shipping_address: order.shipping_address || {
      first_name: "",
      last_name: "",
      city: "",
    },
    order_items: order.order_items || [],
  })) as Order[];

  // Group orders by status
  const newOrders =
    formattedOrders?.filter((order) => order.status === "new") || [];
  const processingOrders =
    formattedOrders?.filter((order) => order.status === "processing") || [];
  const shippedOrders =
    formattedOrders?.filter((order) => order.status === "shipped") || [];
  const deliveredOrders =
    formattedOrders?.filter((order) => order.status === "delivered") || [];
  const cancelledOrders =
    formattedOrders?.filter((order) => order.status === "cancelled") || [];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Orders"
          description="View and manage customer orders"
        />
      </div>

      <Separator />

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All Orders ({formattedOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="new">New Orders ({newOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({processingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({shippedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({deliveredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <OrdersTable data={formattedOrders || []} />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <OrdersTable data={newOrders} />
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <OrdersTable data={processingOrders} />
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          <OrdersTable data={shippedOrders} />
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <OrdersTable data={deliveredOrders} />
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <OrdersTable data={cancelledOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
