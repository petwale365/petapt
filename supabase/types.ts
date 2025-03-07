// supabase/types.ts
import { Database } from "./schema";

// Database Row Types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductImage =
  Database["public"]["Tables"]["product_images"]["Row"];
export type ProductAttribute =
  Database["public"]["Tables"]["product_attributes"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];

// Enum Types
export type AddressType = Database["public"]["Enums"]["address_type"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

// Extended Types with Relations
export type ProductWithDetails = Product & {
  product_images?: ProductImage[];
  product_attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  category?: Category;
};

// Update the CartItem type to match the database schema

// Extended CartItem with product details
export type CartItemWithProductDetails = CartItem & {
  product: ProductWithDetails;
  variant: ProductVariant | null; // Changed from undefined to null to match database
  productImage?: string;
};

// Cart summary information
export type CartSummary = {
  subtotal: number;
  itemCount: number;
};

// Insert Types
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductVariantInsert =
  Database["public"]["Tables"]["product_variants"]["Insert"];
export type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"];
export type CartItemInsert =
  Database["public"]["Tables"]["cart_items"]["Insert"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

// Update Types
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ProductVariantUpdate =
  Database["public"]["Tables"]["product_variants"]["Update"];
export type CartItemUpdate =
  Database["public"]["Tables"]["cart_items"]["Update"];
export type AddressUpdate = Database["public"]["Tables"]["addresses"]["Update"];

export type AppUser = Database["public"]["Tables"]["users"]["Row"];
