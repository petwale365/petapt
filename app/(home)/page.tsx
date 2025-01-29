import CategoriesSection from "@/components/home/categories-sections";
import CollectionsSection from "@/components/home/collections-section";
import Hero from "@/components/home/hero";
import { getCategoriesList } from "@/data/categories";
import { getCollectionList } from "@/data/collections";

export const metadata = {
  title: "Petapt - Find Your Perfect Pet",
  description:
    "Discover and adopt your new best friend from our wide selection of pets.",
};

export default async function Home() {
  const [categories, collections] = await Promise.all([
    getCategoriesList(),
    getCollectionList(),
  ]);
  if (!categories || !collections) return null;
  return (
    <div className="flex flex-col py-16 space-y-16">
      <Hero />
      <div className=" space-y-40 ">
        <CategoriesSection categories={categories} />
        <CollectionsSection collections={collections} />
      </div>
    </div>
  );
}
