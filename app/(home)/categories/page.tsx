import { getCategoriesList } from "@/data/categories";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const CategoriesPage = async () => {
  const categories = await getCategoriesList();

  return (
    <div className="page-center py-36 min-h-screen">
      <h1 className="text-lg sm:text-3xl font-semibold text-primary font-poppins text-center">
        Explore all the Categories
      </h1>
      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 gap-x-10">
        {categories?.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="cursor-pointer group "
          >
            <Image
              src={category.image_url!}
              alt={category.name}
              width={300}
              height={300}
              className="aspect-square rounded-full cursor-pointer"
            />
            <div className=" flex flex-col items-center justify-center mt-5">
              <p className=" text-lg text-primary">{category.name}</p>
              <p className=" text-xs opacity-0 group-hover:opacity-100  text-primary/80 underline transition-all duration-500 ease-in-out  ">
                View All Products
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
