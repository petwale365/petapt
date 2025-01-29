import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { Product } from "@/data/types";

export const ProductCard = ({ product }: { product: Product }) => {
  const { base_price, images, name, slug, sale_price } = product;

  return (
    <div className="group relative border rounded-md  overflow-hidden  pb-1 max-w-72">
      <Link href={`/products/${slug}`}>
        <div className="relative aspect-square overflow-hidden  bg-gray-100 ">
          {images && (
            <Image
              src={images[0].url}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Quick Actions */}
          <div className="absolute right-4 top-4 space-y-2 group">
            <Button size="icon" variant="secondary" className="h-8 w-8 ">
              <Heart className="h-4 w-4 group-hover:fill-primary group-hover:stroke-primary" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-1 px-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 max-sm:text-xs line-clamp-1">
              {name}
            </h3>
          </div>

          <div className="flex items-center justify-between ">
            <p className="text-sm  text-gray-900 max-sm:text-xs">
              Rs.
              <span className=" line-through italic">{base_price}</span>
              <span className="font-semibold text-primary"> {sale_price}</span>
            </p>
            <Button size="sm" variant="ghost" className="">
              <ShoppingCart className="size-5 max-sm:size-2 group-hover:stroke-primary" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};
