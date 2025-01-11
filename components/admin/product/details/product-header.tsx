// components/admin/product/details/product-header.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { Product } from "./types";

interface ProductHeaderProps {
  product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 px-4 md:justify-between">
        <div className="flex flex-1 items-center space-x-4">
          <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <h1 className="text-lg font-semibold md:text-xl">{product.name}</h1>
            <div className="flex items-center space-x-2">
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Draft"}
              </Badge>
              {product.is_featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/products/${product.name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              target="_blank"
            >
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">View</span>
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/products/${product?.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Edit</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
