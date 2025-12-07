'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Icons & UI
import {
  Play, Pause, SkipForward, Volume2, Maximize, Minimize,
  Heart, Share2, Settings, MessageSquare, List, Loader2,
  Calendar, Clock, Star, Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming shadcn button exists
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming shadcn scroll-area exists
import { Separator } from '@/components/ui/separator'; // Assuming shadcn separator exists
import { Badge } from '@/components/ui/badge'; // Assuming shadcn badge exists

// Project Imports
import { api } from '@/lib/axios';
import { RootState } from '@/store/store';
import {
  toggleTheaterMode,
  addToWatchList,
  removeFromWatchList,
  setEpisode,
  toggleAutoPlay
} from '@/store/slices/player-slice';
import AnimeCard from '@/components/cards/anime-card';

export default function WatchPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useDispatch();

  // Local UI State for the Mock Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');

  // Redux State
  const { isTheaterMode, watchList, currentEpisodeIndex, autoPlay } = useSelector((state: RootState) => state.player);
  const isInWatchlist = watchList.includes(Number(id));

  // --- Data Fetching (Parallel) ---
  const { data: anime, isLoading: loadingInfo } = useQuery({
    queryKey: ['anime', id],
    queryFn: async () => (await api.get(`/anime/${id}/full`)).data.data,
  });

  const { data: episodes, isLoading: loadingEpisodes } = useQuery({
    queryKey: ['anime', id, 'episodes'],
    queryFn: async () => (await api.get(`/anime/${id}/episodes`)).data.data,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['anime', id, 'recommendations'],
    queryFn: async () => (await api.get(`/anime/${id}/recommendations`)).data.data.slice(0, 6),
  });

  // --- Handlers ---
  const handleWatchListToggle = () => {
    if (isInWatchlist) dispatch(removeFromWatchList(Number(id)));
    else dispatch(addToWatchList(Number(id)));
  };

  if (loadingInfo || loadingEpisodes) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Summoning Anime...</p>
        </div>
      </div>
    );
  }

  // Filter Episodes
  const filteredEpisodes = episodes?.filter((ep: any) =>
    ep.title?.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    `Episode ${ep.mal_id}`.toLowerCase().includes(episodeSearch.toLowerCase())
  ) || [];

  const currentEpData = episodes?.[currentEpisodeIndex] || { title: 'Unknown', mal_id: 1 };

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* --- Breadcrumbs / Top Bar --- */}
      {!isTheaterMode && (
        <div className="container mx-auto px-4 py-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{anime.title}</span>
          <span className="mx-2">/</span>
          <span className="text-primary">Ep {currentEpData.mal_id}</span>
        </div>
      )}

      {/* --- Main Player Section --- */}
      <div className={`transition-all duration-300 ease-in-out ${isTheaterMode ? 'w-full' : 'container mx-auto px-4'}`}>
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: Video Player */}
          <div className={`flex-1 flex flex-col gap-4 ${isTheaterMode ? 'lg:h-[85vh]' : ''}`}>

            {/* Player Container */}
            <div className={`group relative w-full overflow-hidden bg-black shadow-[0_0_40px_-10px_rgba(189,147,249,0.3)] ${isTheaterMode ? 'h-full' : 'aspect-video rounded-xl border border-white/10'}`}>

              {/* Fake Video Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url(${anime.images.webp.large_image_url})` }}
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full bg-primary/90 p-6 text-background shadow-lg transition transform hover:scale-110 hover:bg-primary"
                >
                  {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current pl-1" />}
                </button>
              </div>

              {/* Custom Controls Bar (Visible on Hover) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {/* Progress Bar */}
                <div className="mb-4 h-1 w-full cursor-pointer rounded-full bg-white/20 hover:h-1.5 transition-all">
                  <div className="h-full w-1/3 rounded-full bg-primary relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-primary transition"><Play size={20} className="fill-white" /></button>
                    <button className="text-white hover:text-primary transition"><SkipForward size={20} /></button>
                    <div className="flex items-center gap-2 group/vol">
                      <Volume2 size={20} className="text-white" />
                      <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                        <div className="h-1 w-20 bg-white/30 rounded-full ml-2">
                          <div className="h-full w-2/3 bg-primary rounded-full" />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-white/80">08:24 / 24:00</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => dispatch(toggleAutoPlay())}
                      className={`text-xs font-bold border border-white/20 px-2 py-0.5 rounded ${autoPlay ? 'text-secondary border-secondary' : 'text-white/50'}`}
                    >
                      AUTO
                    </button>
                    <button className="text-white hover:text-primary transition"><Settings size={20} /></button>
                    <button
                      onClick={() => dispatch(toggleTheaterMode())}
                      className="text-white hover:text-primary transition"
                    >
                      {isTheaterMode ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Meta (Below Player) */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between rounded-xl border border-white/5 bg-card p-6">
              <div className="space-y-1">
                <h1 className="text-xl font-bold md:text-2xl text-foreground line-clamp-1">{anime.title}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="text-primary font-semibold">Episode {currentEpData.mal_id}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>{currentEpData.title}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-md bg-white/5 px-3 py-2 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold">{anime.score}</span>
                </div>

                <button
                  onClick={handleWatchListToggle}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${isInWatchlist
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                    }`}
                >
                  <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                  {isInWatchlist ? 'Remove' : 'Add to List'}
                </button>

                <button className="rounded-md bg-white/5 p-2 text-white hover:bg-white/10 transition">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Episodes List */}
          <div className={`${isTheaterMode ? 'hidden xl:block xl:w-[350px]' : 'w-full lg:w-[350px]'} flex-shrink-0`}>
            <div className="flex h-full flex-col rounded-xl border border-white/5 bg-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" /> Episodes
                  </h3>
                  <span className="text-xs text-muted-foreground">{episodes?.length || 0} EPS</span>
                </div>
                <input
                  type="text"
                  placeholder="Filter episode..."
                  className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                />
              </div>

              <ScrollArea className={`${isTheaterMode ? 'h-[70vh]' : 'h-[500px]'} w-full`}>
                <div className="flex flex-col p-2">
                  {filteredEpisodes.length > 0 ? (
                    filteredEpisodes.map((ep: any, idx: number) => {
                      // Note: Jikan API pagination might mess up direct indexing, typically we match by ID
                      // For this demo we just map index to handle 'current' styling
                      const isActive = idx === currentEpisodeIndex;

                      return (
                        <button
                          key={ep.mal_id}
                          onClick={() => dispatch(setEpisode(idx))}
                          className={`group flex items-center gap-3 rounded-lg p-3 text-left transition ${isActive
                              ? 'bg-primary/20 hover:bg-primary/30'
                              : 'hover:bg-white/5'
                            }`}
                        >
                          <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-black/50">
                            {/* Jikan Episodes often don't have thumbnails, using placeholder logic */}
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/20">
                              EP {ep.mal_id}
                            </div>
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0ms' }} />
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }} />
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce mx-0.5" style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className={`truncate text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                              {ep.title || `Episode ${ep.mal_id}`}
                            </span>
                            <span className="text-xs text-muted-foreground">{ep.aired ? new Date(ep.aired).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No episodes found.</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Details & Recs --- */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Details & Synopsis */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-xl border border-white/5 bg-card p-6">
              <h2 className="mb-4 text-xl font-bold text-accent">Synopsis</h2>
              <p className="leading-7 text-muted-foreground">{anime.synopsis}</p>

              <Separator className="my-6 bg-white/5" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Type</span>
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-secondary" />
                    <span>{anime.type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{anime.status}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Aired</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{anime.year || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Studios</span>
                  <div className="flex flex-wrap gap-1">
                    {anime.studios.map((s: any) => (
                      <span key={s.mal_id} className="text-sm">{s.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {anime.genres.map((genre: any) => (
                  <Badge key={genre.mal_id} variant="secondary" className="bg-white/5 text-foreground hover:bg-white/10 hover:text-primary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comments Placeholder */}
            <div className="rounded-xl border border-white/5 bg-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="text-primary" />
                <h3 className="text-lg font-bold">Comments</h3>
              </div>
              <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-white/10 bg-white/5">
                <p className="text-muted-foreground">Sign in to join the discussion (Coming Soon)</p>
              </div>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-bold text-foreground">You might also like</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {recommendations?.map((rec: any) => (
                <div key={rec.entry.mal_id} className="flex gap-4 group rounded-lg bg-card p-2 hover:bg-white/5 transition border border-transparent hover:border-white/10">
                  <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={rec.entry.images.webp.large_image_url}
                      alt={rec.entry.title}
                      fill
                      className="object-cover transition group-hover:scale-110"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <Link href={`/watch/${rec.entry.mal_id}`} className="font-semibold text-sm line-clamp-2 hover:text-primary transition">
                      {rec.entry.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">TV • {anime.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
