"use client";

import React, { useState } from "react";

import { ProductGallery } from "./product-gallery";

import { Truck, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductInfo } from "./product-info";
import { ProductVariants } from "./product-variants";
import { RelatedProducts } from "./related-products";
import { ProductDetailsProps } from "./types";

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.product_variants?.[0]?.id ?? null
  );

  const selectedVariant = product.product_variants?.find(
    (v) => v.id === selectedVariantId
  );

  const currentPrice = selectedVariant?.price ?? product.base_price;
  const comparePrice = selectedVariant?.compare_at_price ?? product.sale_price;

  const categories = product.product_categories
    .map((pc) => pc.category)
    .filter(Boolean);

  console.log("Product Variants:", product);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery images={product.product_images} />

        {/* Product Info */}
        <div className="space-y-6">
          <ProductInfo
            name={product.name}
            price={currentPrice}
            comparePrice={comparePrice}
            categories={categories}
          />

          {/* Variants Selection */}
          {product.product_variants && product.product_variants.length > 0 && (
            <ProductVariants
              product={product}
              variants={product.product_variants}
              selectedVariantId={selectedVariantId}
              onVariantSelect={setSelectedVariantId}
            />
          )}

          {/* Stock Status */}
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Availability</AlertTitle>
            <AlertDescription>
              {selectedVariant ? (
                selectedVariant.stock_quantity > 0 ? (
                  <span className="text-green-600">
                    In Stock - {selectedVariant.stock_quantity} units available
                  </span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )
              ) : (
                "Please select a variant"
              )}
            </AlertDescription>
          </Alert>

          {/* Shipping Info */}
          <Alert>
            <Truck className="h-4 w-4" />
            <AlertTitle>Free Shipping</AlertTitle>
            <AlertDescription>On orders above ₹499</AlertDescription>
          </Alert>

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <div
                className="prose prose-sm mt-4"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />
            </TabsContent>
            <TabsContent value="specifications">
              {/* Add your specifications content */}
            </TabsContent>
            <TabsContent value="shipping">
              {/* Add your shipping content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts categoryId={product.category_id || ""} />
    </div>
  );
}
