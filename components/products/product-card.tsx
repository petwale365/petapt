"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  product_images: { url: string; alt_text: string }[] | null;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const discount =
    product.base_price - (product.sale_price || product.base_price);
  const discountPercentage = Math.round((discount / product.base_price) * 100);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden rounded-lg border-2 hover:border-primary transition-all duration-300">
        <CardContent className="p-0 relative">
          {product.product_images && product.product_images[0] && (
            <div className="relative aspect-square">
              <Image
                src={product.product_images[0].url}
                alt={product.product_images[0].alt_text || product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          )}
          {product.sale_price && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              {discountPercentage}% OFF
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-4">
          <div className="space-y-2 w-full">
            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.sale_price || product.base_price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.base_price)}
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
