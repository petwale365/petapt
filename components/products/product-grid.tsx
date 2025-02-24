import React from "react";
import { ProductCard } from "./product-card";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  product_images: { url: string; alt_text: string }[] | null;
}

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products?.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};
