// components/admin/product/details/product-content.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProductImages } from "./product-images";
import { ProductVariants } from "./product-variants";
import { Product } from "./types";
import { ProductInfo } from "./product-info";
import { LayoutGrid, Info, ImageIcon } from "lucide-react";

interface ProductContentProps {
  product: Product;
}

export function ProductContent({ product }: ProductContentProps) {
  return (
    <Card className="overflow-hidden border-none shadow-none">
      <Tabs defaultValue="information" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/40 p-0">
          <TabsTrigger
            value="information"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-6 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Information</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="variants"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-6 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Variants</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-6 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Images</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="bg-card p-4 md:p-6">
          <TabsContent
            value="information"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <ProductInfo product={product} />
            </div>
          </TabsContent>

          <TabsContent
            value="variants"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <ProductVariants product={product} />
            </div>
          </TabsContent>

          <TabsContent
            value="images"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <ProductImages images={product.images} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
