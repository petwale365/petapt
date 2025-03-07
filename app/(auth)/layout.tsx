import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //if user is not anonymous, redirect to home
  if (!user?.is_anonymous) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Logo */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full">
          {/* Max width wrapper for forms */}

          <div className="mx-auto max-w-[400px] ">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Link
                href="/"
                className="flex items-center space-x-2 hover:text-foreground underline-offset-4 hover:underline"
              >
                <span className="text-2xl font-bold uppercase italic">
                  Petapt
                </span>
              </Link>
            </div>

            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-4">
              <a
                href="#"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
