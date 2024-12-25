import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Authentication Error - Your Brand",
  description: "There was a problem with your authentication",
};

export default function AuthErrorPage() {
  return (
    <Card className="w-[400px]">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">
              Authentication error
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              There was a problem with your authentication link. Please try
              again or contact support if the problem persists.
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
