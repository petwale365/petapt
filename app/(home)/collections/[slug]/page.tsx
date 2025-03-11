/*eslint-disable */
import CategoryDetailsHeading from "@/components/categories/categories-details-heading";
import { CategoryPagination } from "@/components/home/category-pagination";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getProductsByCollectionSlug } from "@/data/collections";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type Params = Promise<{ slug: string }>;
const ITEMS_PER_PAGE = 6;

const CollectionsDetailsPage = async (props: { params: Params }) => {
  const { slug } = await props.params;
  const collection = await getProductsByCollectionSlug(slug);
  const products = collection?.products.slice(0, ITEMS_PER_PAGE);
  const productsLength = collection?.products ? collection.products.length : 0;

  return (
    <div className="page-center min-h-screen py-36 space-y-10">
      <CategoryDetailsHeading
        name={collection?.name as string}
        description={collection?.description as string}
      />
      {products?.length !== 0 ? (
        <>
          <ul
            className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 "
            data-testid="products-list"
          >
            {products?.map((p) => (
              <ProductCard product={p as any} key={p.id} />
            ))}
          </ul>

          <CategoryPagination totalPages={productsLength / ITEMS_PER_PAGE} />
        </>
      ) : (
        <div className=" flex justify-center items-center  flex-col space-y-5">
          <h1>No products found in this collection </h1>
          <div className=" flex space-x-5">
            <Button className="" asChild variant={"outline"}>
              <Link href="/">
                <ArrowLeft className="h-6 w-6" />
                Go back home
              </Link>
            </Button>
            <Button className="" asChild>
              <Link href="/collections">
                See all collections
                <ArrowRight className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsDetailsPage;
