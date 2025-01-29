"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, "Select at least one product"),
});

type Product = {
  id: string;
  name: string;
  base_price: number;
  sale_price: number | null;
  images: { url: string }[];
  category: { name: string } | null;
};

type AddProductsToCollectionProps = {
  collectionId: string;
  existingProductIds?: string[];
};

export function AddProductsToCollection({
  collectionId,
  existingProductIds = [],
}: AddProductsToCollectionProps) {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productIds: [],
    },
  });

  // Fetch available products that are not in the collection
  React.useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, 
          name,
          base_price,
          sale_price,
          images:product_images(url),
          category:categories(name)
        `
        )
        .filter("id", "not.in", `(${existingProductIds.join(",")})`)
        .eq("is_active", true)
        .order("name");

      if (data && !error) {
        setProducts(data);
      }
    };

    if (open) {
      fetchProducts();
    }
  }, [open, existingProductIds, supabase]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase.from("product_collections").insert(
      values.productIds.map((productId) => ({
        product_id: productId,
        collection_id: collectionId,
      }))
    );

    if (!error) {
      setOpen(false);
      form.reset();
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80%] sm:h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add Products to Collection</DialogTitle>
          <DialogDescription>
            Select products to add to this collection. You can select multiple
            products at once.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 space-y-4"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <FormField
                control={form.control}
                name="productIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ScrollArea className="h-[calc(80vh-280px)] rounded-md border">
                        <div className="p-4 space-y-4">
                          {filteredProducts.map((product) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                            >
                              <Checkbox
                                checked={field.value.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = new Set(field.value);
                                  if (checked) {
                                    currentValue.add(product.id);
                                  } else {
                                    currentValue.delete(product.id);
                                  }
                                  field.onChange(Array.from(currentValue));
                                }}
                              />
                              {product.images?.[0] && (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                  <Image
                                    src={product.images[0].url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">{product.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {product.category && (
                                    <span>{product.category.name}</span>
                                  )}
                                  <span>•</span>
                                  <span>
                                    ₹{product.sale_price || product.base_price}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {filteredProducts.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                              No products found.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.watch("productIds").length === 0}
                >
                  Add {form.watch("productIds").length} Products
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
