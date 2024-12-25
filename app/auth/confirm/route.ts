import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/";

    if (!token_hash || !type) {
      console.error("Missing token_hash or type in auth confirmation");
      return NextResponse.redirect(
        new URL("/auth/auth-code-error", request.url)
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("Error verifying OTP:", error.message);
      return NextResponse.redirect(
        new URL("/auth/auth-code-error", request.url)
      );
    }

    // Successfully verified OTP, redirect to the next page
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("Unexpected error in auth confirmation:", error);
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }
}
