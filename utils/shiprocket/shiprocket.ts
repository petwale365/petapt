import { ShiprocketAuth } from "./config";

// utils/shiprocket.ts
export async function shiprocketRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const token = await ShiprocketAuth.getToken();

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );

    // Handle response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Shiprocket API error");
    }

    return data;
  } catch (error) {
    console.error("Shiprocket request error:", error);
    throw error;
  }
}
