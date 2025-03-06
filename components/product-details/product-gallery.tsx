import React, { useState } from "react";
import { ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";

import Image from "next/image";
import { Image as ImageType } from "./types";

interface ProductGalleryProps {
  images: ImageType[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]?.url);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) {
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={mainImage || "/placeholder.png"}
          alt="Main product image"
          width={500}
          height={500}
          className={cn(
            "h-full w-full object-cover object-center transition-transform duration-200",
            isZoomed && "scale-150"
          )}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : undefined
          }
        />
        {!isZoomed && (
          <button
            className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg"
            onClick={() => setIsZoomed(true)}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setMainImage(image.url)}
            className={cn(
              "aspect-square overflow-hidden rounded-lg bg-gray-100",
              mainImage === image.url && "ring-2 ring-primary"
            )}
          >
            <Image
              width={500}
              height={500}
              src={image.url}
              alt={image.alt_text || "Product thumbnail"}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
