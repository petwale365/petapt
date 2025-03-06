import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/server";
export const dynamic = "force-dynamic";

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

  // First, get the product IDs that match the category filter
  let productIds: string[] = [];
  if (searchParams.categories) {
    const categorySlugs = searchParams.categories.split(",");
    const { data: categoryProducts } = await supabase
      .from("product_categories")
      .select("product_id, categories!inner(slug)")
      .in("categories.slug", categorySlugs);

    if (categoryProducts) {
      productIds = categoryProducts.map((pc) => pc.product_id as string);
      if (productIds.length === 0) return []; // No products in these categories
    }
  }

  // Build the main products query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_images (*),
      product_categories (
        categories (
          name,
          slug
        )
      )
    `
    )
    .eq("is_active", true);

  // Apply category filter if we have product IDs
  if (searchParams.categories && productIds.length > 0) {
    query = query.in("id", productIds);
  }

  // Apply price filter
  if (searchParams.price) {
    const [min, max] = searchParams.price.split("-").map(Number);
    if (!isNaN(min)) query = query.gte("base_price", min);
    if (!isNaN(max)) query = query.lte("base_price", max);
  }

  // Apply search filter
  if (searchParams.search) {
    query = query.textSearch("name", searchParams.search, {
      type: "websearch",
      config: "english",
    });
  }

  // Apply sorting
  switch (searchParams.sort) {
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

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const [products, categories, maxPrice] = await Promise.all([
    getProducts({
      categories: searchParams.categories as string | undefined,
      price: searchParams.price as string | undefined,
      sort: searchParams.sort as string | undefined,
      search: searchParams.search as string | undefined,
    }),
    getCategories(),
    getMaxPrice(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 mt-20">
        {/* Filters Section */}
        <aside className="w-full lg:w-64 lg:pt-10">
          <ProductFilters categories={categories} maxPrice={maxPrice} />
        </aside>

        {/* Products Section */}
        <main className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-left mb-8">
            Explore Our Products
          </h1>
          <div className="w-full max-w-md">
            <SearchInput />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products as unknown as Product[]} />
          </Suspense>

          {products.length === 0 && (
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
