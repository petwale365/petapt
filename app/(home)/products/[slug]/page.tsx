import React from "react";

import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details/product-detail";
import { getProductsBySlug } from "@/data/products";

interface PageProps {
  params: Promise<{ [key: string]: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const products = await getProductsBySlug(resolvedParams.slug);

  if (!products) {
    notFound();
  }

  return (
    <div className="py-20">
      <ProductDetails product={products} />
    </div>
  );
}
