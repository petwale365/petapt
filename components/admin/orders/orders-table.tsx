// app/admin/orders/components/orders-table.tsx
"use client";

import { useState } from "react";
import { columns, type Order } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrdersTableProps {
  data: Order[];
}

export function OrdersTable({ data }: OrdersTableProps) {
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = data.filter((order) => {
    const matchesFilter =
      order.order_number.toLowerCase().includes(filterValue.toLowerCase()) ||
      order.shipping_address.first_name
        .toLowerCase()
        .includes(filterValue.toLowerCase()) ||
      order.shipping_address.last_name
        .toLowerCase()
        .includes(filterValue.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesFilter && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search orders..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
