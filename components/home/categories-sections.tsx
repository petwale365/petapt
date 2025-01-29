import React from "react";
import SectionHeader from "./section-header";

import Image from "next/image";
import Link from "next/link";
import { Category } from "@/supabase/types";

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  return (
    <section className="px-4">
      <SectionHeader
        title="Shop by Category"
        subtitle="Explore various categories of products"
      />

      <div className="flex flex-col sm:flex-row justify-center space-x-4 mt-10 gap-5  ">
        {categories?.slice(0, 4).map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className=" rounded-lg  transition duration-200 ease-in "
          >
            <Image
              src={category?.image_url || ""}
              alt={category.name}
              className="aspect-square hover:scale-105 transition-transform duration-200 ease-in rounded-full "
              width={250}
              height={250}
            />
            <p className="text-xs sm:text-lg font-medium text-zinc-800 text-center mt-3 ">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
