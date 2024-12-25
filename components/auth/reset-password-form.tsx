"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: ResetPasswordFormValues) {
    try {
      setIsPending(true);
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "New password should be different from the old password":
            toast.error(
              "Please use a different password than your current one"
            );
            break;
          case "Auth session missing or expired":
            toast.error(
              "Your reset link has expired. Please request a new one"
            );
            router.push("/forgot-password");
            break;
          default:
            toast.error("Failed to reset password. Please try again");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-[400px]">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">
              Reset your password
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Enter your new password below
            </p>
          </CardHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                placeholder="Enter your new password"
                type="password"
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                placeholder="Confirm your new password"
                type="password"
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
            {isPending ? "Resetting password..." : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
