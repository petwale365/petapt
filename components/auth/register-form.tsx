"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordInput from "./password-input";
import { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

// Validation schema
const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, "Full name is required")
      .max(50, "Full name must be at most 50 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user on component mount
  useEffect(() => {
    supabase.auth.getUser().then((data) => {
      setUser(data.data.user);
    });
  }, [supabase]);

  console.log("User in RegisterForm:", user);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: RegisterFormValues) {
    startTransition(async () => {
      try {
        // Store anonymous user ID if user is anonymous
        const anonUserId = user?.id;
        const isAnonymous = user?.is_anonymous === true;
        console.log("Current user before registration:", {
          anonUserId,
          isAnonymous,
        });

        // Clear existing queries to prevent stale data
        queryClient.removeQueries({ queryKey: ["user"] });
        queryClient.removeQueries({ queryKey: ["cart"] });

        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
            },
          },
        });

        if (error) throw error;

        // If we had an anonymous user before, store the ID to merge cart after email verification
        // Store the anonymous ID in localStorage to retrieve after OAuth redirect
        if (isAnonymous && anonUserId) {
          localStorage.setItem("anonymous_user_id", anonUserId);
          console.log(
            "Stored anonymous user ID for Google signup:",
            anonUserId
          );
        }

        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        router.push("/register/confirmation");
      } catch (error) {
        if (error instanceof Error) {
          switch (error.message) {
            case "User already registered":
              toast.error(
                "This email is already registered. Please login instead."
              );
              break;
            case "Invalid email format":
              toast.error("Please enter a valid email address");
              break;
            default:
              toast.error(`Failed to register: ${error.message}`);
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
        console.log("Anonymous user before Google signup:", {
          anonUserId,
          isAnonymous,
        });

        // Store the anonymous ID in localStorage to retrieve after OAuth redirect
        if (isAnonymous && anonUserId) {
          localStorage.setItem("anonymous_user_id", anonUserId);
          console.log(
            "Stored anonymous user ID for Google signup:",
            anonUserId
          );
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
          },
        });

        if (error) throw error;

        // Redirect happens automatically
      } catch (error) {
        console.error("Google signup error:", error);
        if (error instanceof Error) {
          toast.error(`Failed to sign up: ${error.message}`);
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
            <h2 className="text-2xl font-semibold text-center">
              Create an account
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Enter your details to create your account
            </p>
          </CardHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...register("full_name")}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

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
                placeholder="Create a password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
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
          Sign up with Google
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Login here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
