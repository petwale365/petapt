import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Check if user is authenticated
  // const supabase = await createClient();
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // // If user is authenticated, redirect to home page
  // if (session) {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Logo */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full">
          {/* Max width wrapper for forms */}
          <div className="mx-auto max-w-[400px]">{children}</div>

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
