"use client";

import React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Category } from "./types";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";

interface ProductInfoProps {
  name: string;
  price: number;
  comparePrice: number | null;
  categories: Category[];
}

export function ProductInfo({
  name,
  price,
  comparePrice,
  categories,
}: ProductInfoProps) {
  // Share functionality
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out ${name}`;

  const shareLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      url: `https://wa.me/?text=${shareText} ${shareUrl}`,
    },
  ];

  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <Link key={category?.id} href={`/categories/${category?.slug}`}>
            <Badge variant="secondary" className="hover:bg-secondary/80">
              {category?.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Product Name */}
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>

      {/* Price */}
      <div className="flex items-end gap-4">
        <p className="text-3xl font-bold">₹{price.toLocaleString()}</p>
        {comparePrice && comparePrice > price && (
          <>
            <p className="text-lg text-muted-foreground line-through">
              ₹{comparePrice.toLocaleString()}
            </p>
            <Badge className="bg-green-600">{discount}% OFF</Badge>
          </>
        )}
      </div>

      {/* Social Share */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <span className="text-sm text-muted-foreground">Share:</span>
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-2 rounded-full transition-colors",
              "hover:bg-secondary"
            )}
          >
            <link.icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
