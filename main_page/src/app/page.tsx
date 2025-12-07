'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Components
import AnimeCard from '@/components/cards/anime-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, Flame, Sparkles, TrendingUp, Play, Info,
  ChevronRight, Star, History, User, LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface AnimeResult {
  id: string;
  title: {
    english: string;
    romaji: string;
    native: string;
  };
  image: string;
  cover: string;
  rating?: number;
  type?: string;
  ranking?: number;
  description?: string;
}

// Mock Session State - Set to FALSE to test the "Opt to login" feature
const IS_LOGGED_IN = false;

// Mock History Data
const MOCK_HISTORY = [
  { id: 1, title: 'One Piece', ep: 1072, progress: 65, image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDuy1JW4h8O.png' },
  { id: 2, title: 'Jujutsu Kaisen', ep: 23, progress: 30, image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142765-15aH1H0Gj0rV.png' },
];

export default function Home() {
  const router = useRouter();
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  // 1. Fetch Trending
  const { data: trending, isLoading: loadingTrending, isError } = useQuery<AnimeResult[]>({
    queryKey: ['trending'],
    queryFn: async () => {
      const { data } = await api.get('/trending');
      return data.results;
    },
  });

  // 2. Fetch Popular
  const { data: popular, isLoading: loadingPopular } = useQuery<AnimeResult[]>({
    queryKey: ['popular'],
    queryFn: async () => {
      const { data } = await api.get('/popular');
      return data.results;
    },
  });

  // Derived State for Hero
  const heroAnime = trending?.[0];
  const heroTitle = heroAnime?.title?.english || heroAnime?.title?.romaji || heroAnime?.title?.native;

  // --- Loading State ---
  if (loadingTrending || loadingPopular) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="relative h-[60vh] w-full overflow-hidden bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
        <div className="container mx-auto space-y-8 px-4 py-8">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 bg-background text-center px-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20 delay-75"></div>
          <div className="relative rounded-full bg-destructive/10 p-6 text-destructive">
            <TrendingUp className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">System Failure</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Unable to establish a link. Ensure your local server gateway is active.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary selection:text-black overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      {heroAnime && (
        <section className="relative h-[85vh] w-full overflow-hidden bg-background">
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroAnime.cover}
              alt="Hero Background"
              fill
              priority
              className={cn(
                "object-cover transition-opacity duration-1000",
                heroImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setHeroImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto flex h-full flex-col justify-end px-4 pb-20 lg:pb-32">
            <div className="max-w-2xl animate-in slide-in-from-left-10 fade-in duration-700">

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="default" className="bg-primary text-primary-foreground font-bold px-3 border-none">
                  #{heroAnime.ranking || 1} Trending
                </Badge>
                {/* Adaptive Badges */}
                <Badge variant="outline" className="border-border bg-background/50 backdrop-blur-md text-foreground shadow-sm">
                  <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" /> {heroAnime.rating}%
                </Badge>
                <Badge variant="outline" className="border-border bg-background/50 backdrop-blur-md text-foreground shadow-sm">
                  {heroAnime.type || 'TV Series'}
                </Badge>
              </div>

              {/* Adaptive Title: Uses text-foreground (Black in Light, White in Dark) */}
              <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-2xl line-clamp-2">
                {heroTitle}
              </h1>

              {/* Adaptive Description */}
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground line-clamp-3 md:line-clamp-2 max-w-xl font-medium">
                {heroAnime.description?.replace(/<[^>]*>?/gm, '') || "Experience the latest sensation."}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push(`/watch/${heroAnime.id}`)}
                  className="h-14 gap-2 rounded-xl bg-primary px-8 text-lg font-bold text-primary-foreground shadow-[0_0_20px_-5px_var(--color-primary)] transition-transform hover:scale-105 border-none"
                >
                  <Play className="h-5 w-5 fill-current" /> Watch Now
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 rounded-xl border-border bg-background/50 px-8 text-lg font-medium text-foreground backdrop-blur-md hover:bg-background/80"
                >
                  <Info className="h-5 w-5" /> Details
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN CONTENT GRID --- */}
      <div className="container mx-auto -mt-10 relative z-20 px-4">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* --- LEFT COLUMN: Trending (Takes 9/12 cols) --- */}
          <div className="lg:col-span-9 space-y-16">

            {/* Trending Section */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                    <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                    Trending Now
                  </h2>
                  <p className="text-sm text-muted-foreground">The most watched anime this week</p>
                </div>
                <Link href="/trending" className="group flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {trending?.map((anime: AnimeResult) => (
                  <AnimeCard
                    key={anime.id}
                    id={anime.id}
                    title={anime.title?.english || anime.title?.romaji || anime.title?.native}
                    image={anime.image}
                    score={anime.rating}
                  />
                ))}
              </div>
            </section>

            {/* Popular Section */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                    <Sparkles className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    All Time Popular
                  </h2>
                  <p className="text-sm text-muted-foreground">Classics that never get old</p>
                </div>
                <Link href="/popular" className="group flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {popular?.map((anime: AnimeResult) => (
                  <AnimeCard
                    key={anime.id}
                    id={anime.id}
                    title={anime.title?.english || anime.title?.romaji}
                    image={anime.image}
                    score={anime.rating}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: Sidebar (Takes 3/12 cols) --- */}
          <div className="lg:col-span-3 space-y-8">

            {/* Continue Watching Card */}
            <div className="rounded-2xl border border-border bg-card shadow-sm sticky top-24">
              <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-bold flex items-center gap-2 text-foreground">
                  <History className="h-4 w-4 text-primary" /> Continue Watching
                </h3>
              </div>

              <div className="p-4">
                {IS_LOGGED_IN ? (
                  /* LOGGED IN VIEW */
                  <div className="space-y-4">
                    {MOCK_HISTORY.map((item) => (
                      <div key={item.id} className="group relative flex gap-3 items-center p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div>
                            <h4 className="text-sm font-semibold truncate text-foreground">{item.title}</h4>
                            <span className="text-xs text-muted-foreground">Ep {item.ep}</span>
                          </div>
                          <Progress value={item.progress} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary">
                      View History
                    </Button>
                  </div>
                ) : (
                  /* LOGGED OUT VIEW (Placeholder) */
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-4 p-4 rounded-full bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">Sync your progress</h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed px-2">
                      Sign in to track your watch history and pick up exactly where you left off.
                    </p>
                    <Button className="mt-6 w-full gap-2 shadow-lg hover:shadow-primary/20" size="sm">
                      <LogIn className="h-4 w-4" /> Sign In
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Sidebar Item: Genres/Tags */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
              <h3 className="font-bold text-sm text-foreground mb-4">Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {['Action', 'Adventure', 'Fantasy', 'Sci-Fi', 'Drama'].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
