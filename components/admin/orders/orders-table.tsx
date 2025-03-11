"use client";

import { useState, useTransition } from "react";
import { columns, type Order } from "./columns";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, TruckIcon } from "lucide-react";
import { FulfillOrderDialog } from "./fulfill-order-dialog";

interface OrdersTableProps {
  data: Order[];
}

export function OrdersTable({ data }: OrdersTableProps) {
  const [filterValue, setFilterValue] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [isPending] = useTransition();
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderForFulfillment, setSelectedOrderForFulfillment] =
    useState<Order | null>(null);

  // Handle order selection
  const handleRowSelection = (orders: Order[]) => {
    setSelectedOrders(orders);
  };

  // Handle opening the fulfillment dialog for a single order
  const handleFulfillOrder = (order: Order) => {
    setSelectedOrderForFulfillment(order);
    setIsDialogOpen(true);
  };

  // Filter the data based on search input and payment filter
  const filteredData = data.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(filterValue.toLowerCase()) ||
      (order.user.full_name &&
        order.user.full_name
          .toLowerCase()
          .includes(filterValue.toLowerCase())) ||
      order.user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
      order.shipping_address.first_name
        .toLowerCase()
        .includes(filterValue.toLowerCase()) ||
      order.shipping_address.last_name
        .toLowerCase()
        .includes(filterValue.toLowerCase()) ||
      (order.shipping_address.city &&
        order.shipping_address.city
          .toLowerCase()
          .includes(filterValue.toLowerCase()));

    const matchesPayment =
      paymentFilter === "all" || order.payment_method === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  // Handle bulk fulfillment of selected orders
  const handleBulkFulfill = () => {
    // Only select orders that are in "new" status
    const eligibleOrders = selectedOrders.filter(
      (order) => order.status === "new"
    );

    if (eligibleOrders.length === 1) {
      // If only one order, open the single order fulfillment dialog
      setSelectedOrderForFulfillment(eligibleOrders[0]);
      setIsDialogOpen(true);
    } else if (eligibleOrders.length > 1) {
      // For multiple orders, potentially implement bulk fulfillment UI
      // This is a simplified example - you might need a more complex UI for bulk operations
      alert(
        `Bulk fulfillment for ${eligibleOrders.length} orders is not yet implemented.`
      );
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleBulkFulfill}
              disabled={
                isPending ||
                selectedOrders.filter((order) => order.status === "new")
                  .length === 0
              }
            >
              <TruckIcon className="mr-2 h-4 w-4" />
              Fulfill Selected
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            ...columns,
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => {
                const order = row.original;
                return (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFulfillOrder(order)}
                      disabled={order.status !== "new"}
                    >
                      Fulfill
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={filteredData}
          onRowSelection={handleRowSelection}
        />
      </div>

      {/* Fulfill Order Dialog */}
      {selectedOrderForFulfillment && (
        <FulfillOrderDialog
          order={selectedOrderForFulfillment}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
