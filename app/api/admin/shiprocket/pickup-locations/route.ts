/*eslint-disable */
// app/api/admin/shiprocket/pickup-locations/route.ts
import { NextResponse } from "next/server";
import { shiprocketRequest } from "@/utils/shiprocket/shiprocket";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (assuming you have a users table with role field)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 2. Call Shiprocket API to get pickup locations
    const shiprocketResponse = await shiprocketRequest(
      "/settings/company/pickup"
    );

    // 3. Return the response
    return NextResponse.json(shiprocketResponse);
  } catch (error) {
    console.error("Error fetching pickup locations:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch pickup locations from Shiprocket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
