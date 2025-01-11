"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

import DeleteProductDialog from "./delete-product-dialog";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  sale_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  slug: string;
  created_at: string;
  product_variants: Array<{
    id: string;
    price: number;
    stock_quantity: number;
  }>;
  product_images: Array<{
    id: string;
    url: string;
    is_thumbnail: boolean;
  }>;
  categories: {
    id: string;
    name: string;
  };
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const thumbnailImage = row.original.product_images.find(
        (img) => img.is_thumbnail
      );
      return (
        <div className="flex items-center gap-2">
          {thumbnailImage && (
            <Image
              src={thumbnailImage.url}
              alt={row.original.name}
              className="h-10 w-10 rounded-md object-cover"
              width={40}
              height={40}
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium max-w-[300px] line-clamp-2">
              {row.original.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {row.original.categories.name}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categories",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="max-md:hidden"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 max-md:hidden">
          <div className="flex flex-col">
            <span className="font-medium max-w-[300px] line-clamp-2">
              {row.original.categories.name}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "base_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium line-through text-muted-foreground">
            {formatPrice(row.original.base_price)}
          </span>
          {row.original.sale_price && (
            <span className="text-sm font-bold">
              {formatPrice(row.original.sale_price)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const totalStock = row.original.product_variants.reduce(
        (acc, variant) => acc + variant.stock_quantity,
        0
      );
      return (
        <Badge variant={totalStock > 0 ? "secondary" : "destructive"}>
          {totalStock}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          {row.original.is_active && <Badge variant="default">Active</Badge>}
          {row.original.is_featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.original.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeleteProductDialog row={row} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
