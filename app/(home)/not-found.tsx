import React from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-secondary rounded-full">
            <FileQuestion className="w-16 h-16 text-primary" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or maybe never existed in the first
            place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="default" asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
            </Link>
            Back to Home
          </Button>

          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
