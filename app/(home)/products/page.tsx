import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/server";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  product_images: { url: string; alt_text: string }[] | null;
}

async function getProducts(searchParams: {
  categories?: string;
  price?: string;
  sort?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase.from("products").select(
    `
      *,
      product_images (*),
      category:categories (
        name,
        slug
      )
    `
  );

  // Apply category filter
  const categories = searchParams?.categories;
  if (categories) {
    const categorySlugs = categories.split(",");
    query = query.in("category.slug", categorySlugs);
  }

  // Apply price filter
  const price = searchParams?.price;
  if (price) {
    const [min, max] = price.split("-").map(Number);
    query = query.gte("base_price", min).lte("base_price", max);
  }

  // Apply search filter
  const search = searchParams?.search;
  if (search) {
    query = query.textSearch("name", search, {
      type: "websearch",
      config: "english",
    });
  }

  // Apply sorting
  const sort = searchParams?.sort;
  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return products;
}

async function getCategories() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return categories || [];
}

async function getMaxPrice() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("base_price")
    .order("base_price", { ascending: false })
    .limit(1)
    .single();

  return data?.base_price || 10000;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: SearchParams;
}

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const productsPromise = getProducts({
    categories: searchParams.categories as string | undefined,
    price: searchParams.price as string | undefined,
    sort: searchParams.sort as string | undefined,
    search: searchParams.search as string | undefined,
  });
  const categoriesPromise = getCategories();
  const maxPricePromise = getMaxPrice();

  const [products, categories, maxPrice] = await Promise.all([
    productsPromise,
    categoriesPromise,
    maxPricePromise,
  ]);

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Explore Our Products
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <aside className="lg:w-1/4">
          <ProductFilters categories={categories} maxPrice={maxPrice} />
        </aside>

        {/* Products Section */}
        <main className="lg:w-3/4 space-y-6">
          <div className="w-full max-w-md">
            <SearchInput />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products as unknown as Product[]} />
          </Suspense>

          {products?.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
