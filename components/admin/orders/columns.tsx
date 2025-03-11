// app/admin/orders/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateCell from "./date-cell";

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
    full_name: string | null;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    address_line1?: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id: string;
    variant_id: string | null;
    product: {
      name: string;
      slug: string;
    };
  }>;
  tracking_number?: string | null;
  shiprocket_order_id?: number | null;
  shipment_id?: number | null;
};

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "order_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Order #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.order_number}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {row.original.user.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const { shipping_address, user } = row.original;
      const fullName =
        user.full_name ||
        `${shipping_address.first_name} ${shipping_address.last_name}`;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{fullName}</span>
          <span className="text-xs text-muted-foreground">
            {shipping_address.city}
            {shipping_address.state ? `, ${shipping_address.state}` : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const itemCount = row.original.order_items.length;
      const totalQuantity = row.original.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return (
        <span className="text-sm">
          {totalQuantity} {totalQuantity === 1 ? "item" : "items"} ({itemCount}{" "}
          {itemCount === 1 ? "product" : "products"})
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatPrice(row.getValue("total_amount"))}
      </div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="capitalize">{row.original.payment_method}</span>
        <Badge
          variant={getPaymentStatusVariant(row.original.payment_status)}
          className="capitalize"
        >
          {row.original.payment_status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "tracking",
    header: "Tracking",
    cell: ({ row }) => {
      const { tracking_number, shiprocket_order_id } = row.original;

      if (tracking_number) {
        return (
          <span className="text-xs font-medium text-blue-600">
            {tracking_number}
          </span>
        );
      }

      if (shiprocket_order_id) {
        return (
          <span className="text-xs text-muted-foreground">
            Processing #{shiprocket_order_id}
          </span>
        );
      }

      return <span className="text-xs text-muted-foreground">Not shipped</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Use a client component with useEffect to avoid hydration errors
      return <DateCell value={row.getValue("created_at")} />;
    },
  },
];

function getStatusVariant(status: Order["status"]) {
  switch (status) {
    case "new":
      return "default";
    case "processing":
      return "secondary";
    case "shipped":
      return "info";
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

function getPaymentStatusVariant(status: Order["payment_status"]) {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "default";
  }
}
