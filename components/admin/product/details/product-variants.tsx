// components/admin/product/details/product-variants.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Product } from "./types";
import {
  Layers,
  Package,
  CircleDollarSign,
  Box,
  Tags,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ProductVariantsProps {
  product: Product;
}

export function ProductVariants({ product }: ProductVariantsProps) {
  // Helper function to get display value for an option
  const getOptionDisplayValue = (optionId: string, valueId: string) => {
    const option = product.options.find((opt) => opt.name === optionId);
    const value = option?.values.find((val) => val.value === valueId);
    return value?.display_value || valueId;
  };

  // Calculate some metrics
  const totalStock = product.variants.reduce(
    (acc, v) => acc + v.stock_quantity,
    0
  );
  const averagePrice = Math.round(
    product.variants.reduce((acc, v) => acc + v.price, 0) /
      product.variants.length
  );
  const activeVariants = product.variants.filter((v) => v.is_active).length;

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden ">
          <div className="absolute right-2 top-2 rounded-full bg-primary/10 p-2.5">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Total Stock
              </span>
              <span className="text-2xl font-bold">{totalStock}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden ">
          <div className="absolute right-2 top-2 rounded-full bg-primary/10 p-2.5">
            <CircleDollarSign className="h-4 w-4 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Avg. Price
              </span>
              <span className="text-2xl font-bold">
                {formatPrice(averagePrice)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden ">
          <div className="absolute right-2 top-2 rounded-full bg-primary/10 p-2.5">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Variants
              </span>
              <span className="text-2xl font-bold">
                {product.variants.length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden ">
          <div className="absolute right-2 top-2 rounded-full bg-primary/10 p-2.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Active
              </span>
              <span className="text-2xl font-bold">{activeVariants}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="rounded-md bg-primary/10 p-2">
            <Tags className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">
            Product Options
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.options.map((option) => (
              <div
                key={option.name}
                className="group relative overflow-hidden rounded-lg   p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-2 font-medium">{option.display_name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {option.values.map((value) => (
                    <Badge
                      key={value.value}
                      variant="secondary"
                      className=" bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {value.display_value}
                    </Badge>
                  ))}
                </div>
                {/* <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" /> */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="rounded-md bg-primary/10 p-2">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">
            Product Variants
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="w-[180px]">SKU</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((variant) => (
                  <TableRow key={variant.sku} className="group">
                    <TableCell className="font-mono text-sm uppercase max-w-fit w-56">
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {variant.option_values.map((ov) => (
                          <Badge
                            key={ov.option_id}
                            className=""
                            variant={"secondary"}
                          >
                            {`${ov.option_id}: ${getOptionDisplayValue(
                              ov.option_id,
                              ov.value_id
                            )}`}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(variant.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          variant.stock_quantity < 10
                            ? "destructive"
                            : variant.stock_quantity < 50
                            ? "secondary"
                            : "default"
                        }
                        className="min-w-[3rem]"
                      >
                        {variant.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {variant.is_active ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={
                            variant.is_active
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {variant.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
