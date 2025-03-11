"use server";

import { Database } from "@/supabase/schema";
import { createClient } from "@/utils/supabase/server";

// Define the return type for the order query
export type OrderWithRelations = {
  id: string;
  order_number: string;
  user_id: string;
  status: Database["public"]["Enums"]["order_status"];
  total_amount: number;
  shipping_fee: number | null;
  subtotal: number;
  payment_method: Database["public"]["Enums"]["payment_method"];
  payment_status: Database["public"]["Enums"]["payment_status"];
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_address_id: string;
  billing_address_id: string;
  shiprocket_order_id: number | null;
  shipment_id: number | null;
  tracking_number: string | null;
  courier_name: string | null;
  length: number | null;
  breadth: number | null;
  height: number | null;
  weight: number | null;
  pickup_location: string | null;
  created_at: string | null;
  updated_at: string | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id: string;
    variant_id: string | null;
    product: {
      name: string;
      slug: string;
    } | null;
  }>;
};

/**
 * Fetches orders with their related data
 */
export async function fetchOrdersWithRelations(options?: {
  limit?: number;
  page?: number;
  status?: Database["public"]["Enums"]["order_status"];
  userId?: string;
  orderBy?: "created_at" | "total_amount" | "order_number";
  ascending?: boolean;
}): Promise<{
  data: OrderWithRelations[] | null;
  error: Error | null;
  count: number | null;
}> {
  const supabase = await createClient();

  // Default options
  const {
    limit = 50,
    page = 1,
    status,
    userId,
    orderBy = "created_at",
    ascending = false,
  } = options || {};

  try {
    // First fetch orders with addresses and order items
    let query = supabase.from("orders").select(
      `
        *,
        shipping_address:addresses!shipping_address_id(
          first_name, 
          last_name, 
          address_line1, 
          address_line2, 
          city, 
          state, 
          postal_code, 
          country, 
          phone
        ),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          variant_id,
          product:products(name, slug)
        )
        `,
      { count: "exact" }
    );

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Execute the query with sorting and pagination
    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(from, to);

    if (error) throw error;

    // Return the data with the count
    return {
      data: data as OrderWithRelations[] | null,
      error: null,
      count,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      data: null,
      error: error as Error,
      count: null,
    };
  }
}

/**
 * Fetch a single order by ID with all its related data
 */
export async function fetchOrderById(orderId: string): Promise<{
  data: OrderWithRelations | null;
  error: Error | null;
}> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        shipping_address:addresses!shipping_address_id(
          first_name, 
          last_name, 
          address_line1, 
          address_line2, 
          city, 
          state, 
          postal_code, 
          country, 
          phone
        ),
        billing_address:addresses!billing_address_id(
          first_name, 
          last_name, 
          address_line1, 
          address_line2, 
          city, 
          state, 
          postal_code, 
          country
        ),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          variant_id,
          product:products(id, name, slug, base_price)
        )
        `
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;

    // If you need user data, fetch it separately since it's in auth.users
    if (data) {
      // Get user info if needed
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(data.user_id);

      if (userError) {
        console.warn("Could not fetch user details:", userError);
      }

      // Return combined data
      return {
        data: {
          ...data,
          user: userData?.user
            ? {
                email: userData.user.email || "",
                full_name: userData.user.user_metadata?.full_name || null,
              }
            : null,
        } as OrderWithRelations,
        error: null,
      };
    }

    return {
      data: null,
      error: new Error("Order not found"),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      data: null,
      error: error as Error,
    };
  }
}
