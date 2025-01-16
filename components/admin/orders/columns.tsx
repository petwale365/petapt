// app/admin/orders/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export type Order = {
  id: string;
  order_number: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  payment_method: "razorpay" | "cod";
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
  user: {
    email: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    city: string;
  };
  order_items: Array<{
    quantity: number;
    unit_price: number;
    product: {
      name: string;
    };
  }>;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_number",
    header: "Order Number",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.order_number}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.user.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => formatPrice(row.getValue("total_amount")),
  },
  {
    accessorKey: "payment_method",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="capitalize">{row.original.payment_method}</span>
        <Badge variant={getPaymentStatusVariant(row.original.payment_status)}>
          {row.original.payment_status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <span>{new Date(row.getValue("created_at")).toLocaleDateString()}</span>
    ),
  },
];

function getStatusVariant(status: Order["status"]) {
  switch (status) {
    case "new":
      return "default";
    case "processing":
      return "secondary";
    case "shipped":
      return "outline";
    case "delivered":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

function getPaymentStatusVariant(status: Order["payment_status"]) {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "outline";
    case "failed":
      return "destructive";
    default:
      return "default";
  }
}
