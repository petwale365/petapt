"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="w-[400px]">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {error.message || "An error occurred during authentication."}
            </p>
          </CardHeader>

          <div className="flex gap-4">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button asChild>
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
