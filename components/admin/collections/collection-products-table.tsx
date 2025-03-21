/* eslint-disable */
// app/admin/collections/[id]/products-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { EllipsisVertical, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import DeleteProductCollections from "./delete-product-collections";

interface ProductsTableProps {
  products: any[];
  collectionId: string;
  existingProductIds?: string[];
}

export function ProductsTable({
  products,
  collectionId,
  existingProductIds,
}: ProductsTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No products in this collection.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.images?.[0] && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          className="object-cover"
                          fill
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(product.base_price)}</TableCell>
                <TableCell>
                  {product.sale_price ? formatPrice(product.sale_price) : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <DeleteProductCollections
                    productId={product.id}
                    collectionId={collectionId}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
