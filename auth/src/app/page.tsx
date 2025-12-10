"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, Lock, Zap, Shield, Loader2, PlayCircle, Users, Layout } from "lucide-react";
import Link from "next/link";

const BackgroundDecor = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
  </div>
);
export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("http://dracula.com");
    }
  }, [session, isPending, router]);

  // --- Shared Background Component ---

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
      <BackgroundDecor />

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32 space-y-24">

        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_-10px_var(--color-primary)]">
              <Ghost className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground drop-shadow-2xl">
            Stream Anime. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Track Your Journey.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for anime enthusiasts. Sync your progress, join the community,
            and experience high-quality streaming with our secure authentication system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary)] transition-all hover:scale-105">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg bg-background/50 border-border backdrop-blur-md hover:bg-white/5 transition-all">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Secure Authentication</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Enterprise-grade security with email verification and Google OAuth integration to keep your account safe.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Sync Progress</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Never lose your place. Your watch history is automatically synced across all your devices in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Community Features</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Join the discussion. Comment on episodes, rate anime, and share your favorite moments with others.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Developer / API Section */}
        <div className="max-w-4xl mx-auto pt-10">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-card/80 to-background/50 backdrop-blur-xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-foreground">Built for Developers</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              DraculaStream offers a robust API for external integrations.
              Documentation is available for developers wanting to extend the platform.
            </p>
            <Button asChild variant="outline" className="border-primary/20 hover:border-primary/50 text-foreground hover:bg-primary/5">
              <Link href="/api-docs">View API Documentation</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
