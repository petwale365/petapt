import React from "react";
import SectionHeader from "./section-header";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/supabase/types";

interface CollectionsSectionProps {
  collections: Collection[];
}

const CollectionsSection = ({ collections }: CollectionsSectionProps) => {
  return (
    <section className="px-4">
      <SectionHeader
        title="Shop by Collections"
        subtitle="Explore various collections of products"
      />

      <div className="flex flex-col sm:flex-row justify-center space-x-4 mt-10 gap-5  ">
        {collections?.slice(0, 4).map((collection) => (
          <Link
            href={`/categories/${collection.slug}`}
            key={collection.id}
            className="border border-transparent rounded-lg overflow-hidden hover:border-primary/10 transition duration-200 ease-in "
          >
            <Image
              src={collection?.image_url || ""}
              alt={collection.name}
              className="aspect-square hover:scale-105 transition-transform duration-200 ease-in "
              width={250}
              height={250}
            />
            <p className="text-xs sm:text-lg font-medium text-zinc-800 text-center mt-3 ">
              {collection.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CollectionsSection;
