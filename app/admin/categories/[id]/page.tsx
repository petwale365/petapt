import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import {
  Pencil,
  Package,
  ExternalLink,
  ChevronRight,
  Search,
  Calendar,
  Link2,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductsTable } from "@/components/admin/categories/category-product-table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function CategoryDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select(
      `*,
      products:product_categories(
        product:products(
          id,
          name,
          slug,
          base_price,
          sale_price,
          is_active,
          images:product_images(url)
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !category) {
    return null;
  }

  const products = category.products.map((p) => p.product);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-screen-2xl">
          <div className="flex h-14 items-center justify-between px-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/admin/categories"
                className="text-muted-foreground hover:text-foreground"
              >
                Categories
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1 font-medium">{category.name}</span>
            </nav>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                asChild
              >
                <Link
                  href={`/store/categories/${category.slug}`}
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/admin/categories/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl space-y-8 p-4 pt-6 md:p-8">
        {/* Hero Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {category.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? "Active" : "Draft"}
                </Badge>
              </div>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    items in category
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(new Date(category.created_at!), "MMM d")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(category.created_at!), "yyyy")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {category.image_url ? (
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/9] md:aspect-[2/1]">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Card>
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* URL Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Link2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  Slug
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <code className="rounded bg-muted px-2 py-1 text-sm">
                {category.slug}
              </code>
            </CardContent>
          </Card>

          {/* SEO Keywords Count */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  Keywords
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {category.seo_keywords?.length || 0}
              </div>
            </CardContent>
          </Card>

          {/* SEO Status */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  SEO Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={category.seo_title ? "default" : "secondary"}>
                {category.seo_title ? "Optimized" : "Not Set"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* SEO Details */}
        <Card>
          <CardHeader>
            <CardTitle>Search Engine Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">SEO Title</h4>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm">
                      {category.seo_title || "No SEO title set"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">SEO Description</h4>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm">
                      {category.seo_description || "No SEO description set"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">SEO Keywords</h4>
                <ScrollArea className="h-[180px] rounded-md border">
                  <div className="flex flex-wrap gap-2 p-4">
                    {category.seo_keywords?.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="px-2 py-0.5 text-xs"
                      >
                        {keyword}
                      </Badge>
                    )) || (
                      <p className="text-sm text-muted-foreground">
                        No keywords have been set
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage products in this category
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products?category=${category.id}`}>
                View All Products
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <ProductsTable products={products} />
        </Card>
      </div>
    </div>
  );
}
