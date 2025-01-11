// components/admin/product/details/product-info.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "./types";
import {
  Newspaper,
  Tags,
  Search,
  FileText,
  Type,
  AlignLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-8">
      {/* Description Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 bg-primary/5 [mask-image:radial-gradient(farthest-side_at_bottom_left,transparent_40%,white)]" />
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="rounded-md bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">
            Product Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-7 text-muted-foreground [text-wrap:balance]">
            {product.description || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* Attributes Section */}
      {product.attributes.length > 0 && (
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 bg-primary/5 [mask-image:radial-gradient(farthest-side_at_bottom_left,transparent_40%,white)]" />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="rounded-md bg-primary/10 p-2">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">
              Product Attributes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead className="pl-10">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.attributes.map((attr) => (
                  <TableRow key={attr.name} className="">
                    <TableCell className="font-medium">
                      {attr.name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </TableCell>
                    <TableCell className="text-justify pl-10">
                      {attr.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* SEO Information Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 bg-primary/5 [mask-image:radial-gradient(farthest-side_at_bottom_left,transparent_40%,white)]" />
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="rounded-md bg-primary/10 p-2">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">
            SEO Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SEO Title */}
          <div className="relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
            <div className="mb-2 flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-muted-foreground">SEO Title</h4>
            </div>
            <p className="text-sm">
              {product.seo_title || "No SEO title provided."}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {/* SEO Description */}
          <div className="relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
            <div className="mb-2 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-muted-foreground">
                Meta Description
              </h4>
            </div>
            <p className="text-sm">
              {product.seo_description || "No SEO description provided."}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {/* Keywords */}
          {product.seo_keywords.length > 0 && (
            <div className="relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent">
              <div className="mb-3 flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-muted-foreground">Keywords</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.seo_keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
