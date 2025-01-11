// components/admin/product/details/product-images.tsx
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { ProductImage } from "./types";

interface ProductImagesProps {
  images: ProductImage[];
}

export function ProductImages({ images }: ProductImagesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Images</h3>
        <p className="text-sm text-muted-foreground">
          {images.length} image{images.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border bg-background",
              image.is_thumbnail && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt_text || "Product image"}
              className="object-cover transition-all duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {image.is_thumbnail && (
              <div className="absolute left-2 top-2">
                <Badge className="bg-background/80 backdrop-blur-sm">
                  Thumbnail
                </Badge>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm">Sort order: {image.sort_order}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
