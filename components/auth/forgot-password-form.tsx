"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const supabase = createClient();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      setIsPending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset link sent to your email!");
      setIsEmailSent(true);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Email not found":
            toast.error("No account found with this email address");
            break;
          case "Email rate limit exceeded":
            toast.error("Too many requests. Please try again later");
            break;
          default:
            toast.error("Failed to send reset link. Please try again");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (isEmailSent) {
    return (
      <Card className="w-[400px]">
        <CardContent className="p-6 pt-8">
          <div className="flex flex-col items-center gap-4">
            <CardHeader className="space-y-1 p-0">
              <h2 className="text-2xl font-semibold text-center">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ve sent you a password reset link. Please check your
                inbox.
              </p>
            </CardHeader>

            <Button asChild className="w-full mt-4">
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[400px]">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">
              Forgot your password?
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Enter your email and we&apos;ll send you a reset link
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
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
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
