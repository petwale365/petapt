import { Database } from "./schema";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Address Types
export type Address = Tables<"addresses">;
export type AddressType = Enums<"address_type">;

// Product Types
export type Product = Tables<"products">;
export type ProductVariant = Tables<"product_variants">;
export type ProductImage = Tables<"product_images">;
export type ProductAttribute = Tables<"product_attributes">;
export type ProductAttributeValue = Tables<"product_attribute_values">;
export type ProductOption = Tables<"product_options">;
export type ProductOptionValue = Tables<"option_values">;
export type ProductCategory = Tables<"product_categories">;
export type ProductCollection = Tables<"product_collections">;
export type RelatedProduct = Tables<"related_products">;

// Category and Collection Types
export type Category = Tables<"categories">;
export type Collection = Tables<"collections">;

// Inventory Types
export type InventoryTransaction = Tables<"inventory_transactions">;
export type VariantOptionValue = Tables<"variant_option_values">;

// User Types
export type AppUser = Tables<"users">;
