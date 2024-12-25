import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Registration Confirmation - Your Brand",
  description: "Check your email to confirm your account",
};

export default function ConfirmationPage() {
  return (
    <Card className="w-[400px]">
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center gap-4">
          <CardHeader className="space-y-1 p-0">
            <h2 className="text-2xl font-semibold text-center">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              We've sent you a confirmation email. Please check your inbox and
              follow the instructions to verify your account.
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
