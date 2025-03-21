"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import PasswordInput from "./password-input";
import { User } from "@supabase/supabase-js";

import { useCart } from "@/hooks/use-cart";
import { useQueryClient } from "@tanstack/react-query";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { refetch } = useCart();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then((data) => {
      setUser(data.data.user);
    });
  }, [supabase]);

  console.log("User in LoginForm:", user);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: LoginFormValues) {
    startTransition(async () => {
      try {
        // Store anonymous user ID if user is anonymous
        const anonUserId = user?.id;
        const isAnonymous = user?.is_anonymous === true;
        console.log("Current user before login:", { anonUserId, isAnonymous });

        // Clear existing queries to prevent stale data
        queryClient.removeQueries({ queryKey: ["user"] });
        queryClient.removeQueries({ queryKey: ["cart"] });

        const { data: authData, error } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (error) {
          throw error;
        }

        // Successfully logged in
        console.log("Successfully logged in as:", authData.user?.id);

        // If we had an anonymous user before, merge their cart
        if (isAnonymous && anonUserId) {
          console.log("Merging anonymous cart:", anonUserId);

          try {
            await supabase.rpc("copy_anon_cart", {
              anonymous_id: anonUserId.toString(),
            });
            console.log("Successfully copied items from anonymous cart");
          } catch (copyError) {
            console.error("Failed to copy anonymous cart:", copyError);
          }
        }

        // Make sure to refetch the cart with the new user ID
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        refetch();

        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          switch (error.message) {
            case "Invalid login credentials":
              toast.error("Invalid email or password");
              break;
            case "Email not confirmed":
              toast.error("Please verify your email before logging in");
              break;
            case "Too many requests":
              toast.error("Too many attempts. Please try again later");
              break;
            default:
              toast.error("Failed to login. Please try again");
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    });
  }

  async function handleGoogleLogin() {
    startTransition(async () => {
      try {
        // Store anonymous user ID before redirect
        const anonUserId = user?.id;
        const isAnonymous = user?.is_anonymous === true;
        console.log("Anonymous user before Google login:", {
          anonUserId,
          isAnonymous,
        });

        // Store the anonymous ID in localStorage to retrieve after OAuth redirect
        if (isAnonymous && anonUserId) {
          localStorage.setItem("anonymous_user_id", anonUserId);
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
          },
        });

        if (error) {
          throw error;
        }

        // The redirect will happen automatically if no error
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Failed to login. Please try again");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    });
  }

  return (
    <Card className="w-[400px] shadow-2xl shadow-stone-300">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">Welcome back</h2>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to login to your account.
            </p>
          </CardHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="hi@yourcompany.com"
                type="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" {...register("remember")} />
              <Label
                htmlFor="remember"
                className="font-normal text-muted-foreground"
              >
                Remember me
              </Label>
            </div>
            <a
              href="/forgot-password"
              className="text-sm underline hover:no-underline"
            >
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          disabled={isPending}
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="size-4" />
          Login with Google
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Create one here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
