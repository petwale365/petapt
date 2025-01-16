"use server";

import { createClient } from "../supabase/server";

class ShiprocketAuth {
  private static async getValidToken() {
    const supabase = await createClient();

    // 1. Check if we have a valid token and return it
    const { data: auth } = await supabase
      .from("shiprocket_auth")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("Inside getValidToken");
    console.log("auth", auth);

    // 2. If valid token exists, return it
    if (auth?.token) {
      return auth.token;
    }

    // 3. If no valid token, generate new one
    return await this.generateNewToken();
  }

  private static async generateNewToken() {
    try {
      const response = await fetch(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
          }),
        }
      );

      const data = await response.json();

      console.log("Inside generateNewToken");
      console.log("data", data);

      if (data.token) {
        // Store new token
        const supabase = await createClient();
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 9); // 9 days instead of 10 for safety margin

        await supabase.from("shiprocket_auth").insert({
          token: data.token,
          email: process.env.SHIPROCKET_EMAIL!,
          expires_at: expires_at.toISOString(),
        });

        return data.token;
      }

      throw new Error("Failed to get token");
    } catch (error) {
      console.error("Shiprocket auth error:", error);
      throw error;
    }
  }

  // Public method to get token
  public static async getToken() {
    return await this.getValidToken();
  }
}

export { ShiprocketAuth };
