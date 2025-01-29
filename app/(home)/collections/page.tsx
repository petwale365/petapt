import { getCollectionList } from "@/data/collections";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const CollectionsPage = async () => {
  const collections = await getCollectionList();

  return (
    <div className="page-center py-36 min-h-screen">
      <h1 className="text-lg sm:text-3xl font-semibold text-primary font-poppins text-center">
        Explore all the Collections
      </h1>
      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 gap-x-10 justify-center">
        {collections?.map((collection) => (
          <Link
            href={`/collections/${collection.slug}`}
            key={collection.id}
            className="cursor-pointer group "
          >
            <Image
              src={collection.image_url!}
              alt={collection.name}
              width={300}
              height={300}
              className="aspect-square rounded-full cursor-pointer"
            />
            <div className=" flex flex-col items-center justify-center mt-5">
              <p className=" text-lg text-primary">{collection.name}</p>
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

export default CollectionsPage;
