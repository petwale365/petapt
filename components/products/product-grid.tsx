"use client";
import React from "react";
import { motion } from "framer-motion";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};
