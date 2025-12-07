"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Lock, Zap, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Film className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Movie Streaming Authentication
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure, scalable authentication service built with Better Auth and Next.js.
            Perfect for movie streaming platforms and external integrations.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Required email verification ensures only verified users can access your platform.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Google OAuth</CardTitle>
              <CardDescription>
                One-click sign-in with Google for a seamless authentication experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>External API</CardTitle>
              <CardDescription>
                API endpoints for external services to integrate with your authentication system.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* API Documentation CTA */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Developer Documentation</CardTitle>
            <CardDescription>
              Learn how to integrate this authentication service with your external applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/api-docs">View API Documentation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}