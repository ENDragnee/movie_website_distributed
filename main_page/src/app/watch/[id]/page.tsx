'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/axios';

// State & UI Libraries
import { RootState } from '@/store/store';
import {
  toggleTheaterMode, addToWatchList, removeFromWatchList,
  setCurrentEpisodeId, toggleAutoPlay
} from '@/store/slices/player-slice';
import HLSPlayer from '@/components/player/hls-player';
import {
  Maximize, Minimize, Heart, ChevronRight, List, Loader2,
  Calendar, Star, PlayCircle, Share2, Download, Info, Search,
  ChevronLeft, ArrowLeft, MessageSquare, Send, User, Lock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// --- Types ---
interface Episode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
}

interface Studio {
  name: string;
}

interface AnimeInfo {
  id: string;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  cover: string;
  image: string;
  description: string;
  rating?: number;
  releaseDate?: string;
  type?: string;
  status?: string;
  genres?: string[];
  studios?: Studio[];
  episodes: Episode[];
}

interface StreamSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface StreamData {
  headers?: {
    Referer?: string;
  };
  sources: StreamSource[];
  download?: string;
}

// --- Mock Data & Config ---
const IS_LOGGED_IN = false; // Toggle this to true to unlock comments
const MOCK_COMMENTS = [
  { id: 1, user: "AnimeFan99", text: "This episode was absolute cinema! The animation quality went through the roof.", time: "2 hours ago", avatar: "AF" },
  { id: 2, user: "DraculaLover", text: "Can't believe they ended it on a cliffhanger like that. Next week can't come soon enough.", time: "5 hours ago", avatar: "DL" },
  { id: 3, user: "Guest_User", text: "Does anyone know the name of the OST that played during the fight scene?", time: "1 day ago", avatar: "GU" },
];

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const animeId = params.id as string;
  const dispatch = useDispatch();
  const episodeListRef = useRef<HTMLDivElement>(null);

  // --- Redux State ---
  const { isTheaterMode, watchList, currentEpisodeId, autoPlay } = useSelector((state: RootState) => state.player);
  const isInWatchlist = watchList.includes(animeId);

  // --- Local State ---
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [audioMode, setAudioMode] = useState<'sub' | 'dub'>('sub');

  // --- 1. Fetch Anime Info ---
  const { data: anime, isLoading: loadingInfo, isError } = useQuery<AnimeInfo>({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      const { data } = await api.get(`/info/${animeId}`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  // --- 2. Determine Active Episode ---
  const activeEpisode = useMemo(() => {
    if (!anime?.episodes?.length) return null;
    return anime.episodes.find((e) => e.id === currentEpisodeId) || anime.episodes[0];
  }, [anime, currentEpisodeId]);

  // --- 3. Fetch Stream (Triggers Refetch on Audio Change) ---
  const { data: stream, isLoading: loadingStream } = useQuery<StreamData>({
    queryKey: ['stream', activeEpisode?.id, audioMode],
    queryFn: async () => {
      if (!activeEpisode?.id) return null;
      const { data } = await api.get(`/watch/${activeEpisode.id}`, {
        params: { type: audioMode }
      });
      return data;
    },
    enabled: !!activeEpisode?.id,
    staleTime: 1000 * 60 * 10,
  });

  // --- Effects ---
  useEffect(() => {
    if (anime?.episodes?.length && !currentEpisodeId) {
      dispatch(setCurrentEpisodeId(anime.episodes[0].id));
    }
  }, [anime, currentEpisodeId, dispatch]);

  useEffect(() => {
    if (activeEpisode && episodeListRef.current) {
      const activeElement = document.getElementById(`ep-${activeEpisode.id}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeEpisode, isTheaterMode]);

  // --- Helper Logic ---
  const videoSource = useMemo(() => {
    if (!stream?.sources) return null;

    const source = stream.sources.find((s) => s.quality === 'default')
      || stream.sources.find((s) => s.quality === 'backup')
      || stream.sources[0];

    if (!source?.url) return null;

    const referer = stream.headers?.Referer || 'https://gogoanime.hu/';
    return `/api/proxy?url=${encodeURIComponent(source.url)}&referer=${encodeURIComponent(referer)}`;
  }, [stream]);

  const handleNextEp = () => {
    if (!anime?.episodes || !activeEpisode) return;
    const currIdx = anime.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currIdx < anime.episodes.length - 1) {
      dispatch(setCurrentEpisodeId(anime.episodes[currIdx + 1].id));
    }
  };

  const handlePrevEp = () => {
    if (!anime?.episodes || !activeEpisode) return;
    const currIdx = anime.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currIdx > 0) {
      dispatch(setCurrentEpisodeId(anime.episodes[currIdx - 1].id));
    }
  };

  const filteredEpisodes = useMemo(() => {
    if (!anime?.episodes) return [];
    return anime.episodes.filter((ep) =>
      ep.number.toString().includes(episodeSearch) ||
      (ep.title && ep.title.toLowerCase().includes(episodeSearch.toLowerCase()))
    );
  }, [anime, episodeSearch]);

  // --- Loading / Error States ---
  if (loadingInfo) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Summoning Anime...</p>
      </div>
    );
  }

  if (isError || !anime) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background text-center">
        <h1 className="text-4xl font-bold text-destructive">Anime Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
          <ArrowLeft size={16} /> Return Home
        </Button>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji || anime.title.native || "Unknown Title";

  return (
    <div className="relative min-h-screen bg-background pb-20 overflow-x-hidden">

      {/* --- Dynamic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={anime.cover}
          alt="background"
          fill
          priority
          className="object-cover opacity-[0.15] blur-3xl scale-110 grayscale-30"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col">

        {/* --- Navigation Bar --- */}
        {!isTheaterMode && (
          <header className="container mx-auto px-4 py-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground backdrop-blur-md rounded-full bg-secondary/30 border border-border px-4 py-2 w-fit">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px] md:max-w-[300px] text-foreground font-medium">{title}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-primary font-bold">Ep {activeEpisode?.number}</span>
            </nav>
          </header>
        )}

        {/* --- Main Content --- */}
        <main className={cn(
          "transition-all duration-500 ease-in-out",
          isTheaterMode ? "w-full px-0" : "container mx-auto px-4"
        )}>
          <div className="flex flex-col xl:flex-row gap-6">

            {/* LEFT: Player Section */}
            <div className={cn(
              "flex-1 flex flex-col gap-6",
              isTheaterMode ? "h-[92vh]" : ""
            )}>

              {/* Player Container */}
              <div className={cn(
                "relative bg-black overflow-hidden shadow-2xl ring-1 ring-border group",
                isTheaterMode ? "h-full w-full" : "aspect-video rounded-2xl"
              )}>
                {loadingStream ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/50 backdrop-blur-sm z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Fetching Stream</span>
                    <Badge variant="outline" className="mt-2 border-primary/20 text-primary">
                      {audioMode.toUpperCase()} MODE
                    </Badge>
                  </div>
                ) : videoSource ? (
                  <HLSPlayer
                    src={videoSource}
                    poster={anime.cover}
                    autoPlay={autoPlay}
                    currentAudio={audioMode}
                    onAudioChange={(mode: 'sub' | 'dub') => setAudioMode(mode)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card">
                    <Info className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Stream unavailable for this episode.</p>
                  </div>
                )}
              </div>

              {/* Player Controls & Meta */}
              <div className={cn(
                "flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-xl shadow-xl transition-all",
                isTheaterMode ? "fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 opacity-0 hover:opacity-100" : "relative"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground line-clamp-1 drop-shadow-sm">{title}</h1>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        EP {activeEpisode?.number}
                      </Badge>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {anime.rating}%</span>
                      <Separator orientation="vertical" className="h-3 bg-border" />
                      <span>{anime.releaseDate}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-secondary/50 rounded-lg border border-border p-1">
                      <Button variant="ghost" size="icon" onClick={handlePrevEp} disabled={activeEpisode?.number === 1} className="h-8 w-8 hover:bg-white/5">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-4 bg-border mx-1" />
                      <Button variant="ghost" size="icon" onClick={handleNextEp} className="h-8 w-8 hover:bg-white/5">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => isInWatchlist ? dispatch(removeFromWatchList(animeId)) : dispatch(addToWatchList(animeId))}
                      variant={isInWatchlist ? "destructive" : "secondary"}
                      className="gap-2 h-10 px-4"
                    >
                      <Heart className={cn("h-4 w-4", isInWatchlist && "fill-current")} />
                      <span className="hidden sm:inline">{isInWatchlist ? "Saved" : "Watchlist"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dispatch(toggleTheaterMode())}
                      className={cn("h-10 w-10 hover:bg-primary/20 hover:text-primary transition-colors", isTheaterMode && "text-primary")}
                    >
                      {isTheaterMode ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar Section */}
            <div className={cn(
              "shrink-0 flex flex-col gap-6 transition-all duration-300",
              isTheaterMode ? "hidden 2xl:flex w-[400px]" : "w-full xl:w-[380px]"
            )}>

              {/* Episode List Card */}
              <div className="flex flex-col h-[650px] rounded-2xl border border-border bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border bg-white/2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <List className="h-4 w-4 text-primary" /> Episodes
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">{anime.episodes?.length || 0} EPS</span>
                      <div
                        onClick={() => dispatch(toggleAutoPlay())}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold cursor-pointer transition-all select-none",
                          autoPlay
                            ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_-4px_var(--color-primary)]"
                            : "border-border text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        <PlayCircle className="h-3 w-3" /> AUTO
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search episode..."
                      className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all placeholder:text-muted-foreground/50"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* List */}
                <ScrollArea className="flex-1" ref={episodeListRef}>
                  <div className="p-2 flex flex-col gap-1">
                    {filteredEpisodes.length > 0 ? (
                      filteredEpisodes.map((ep) => {
                        const isActive = ep.id === activeEpisode?.id;
                        return (
                          <button
                            key={ep.id}
                            id={`ep-${ep.id}`}
                            onClick={() => dispatch(setCurrentEpisodeId(ep.id))}
                            className={cn(
                              "group relative flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 border border-transparent",
                              isActive
                                ? "bg-primary/10 border-primary/20 shadow-[inset_0_0_20px_-10px_var(--color-primary)]"
                                : "hover:bg-white/5 hover:border-border"
                            )}
                          >
                            <div className="relative h-12 w-20 shrink-0 rounded-lg bg-black/40 overflow-hidden border border-border">
                              {ep.image ? (
                                <Image src={ep.image} alt="" fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-card text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                  EP {ep.number}
                                </div>
                              )}

                              {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                                  <div className="flex gap-0.5 items-end h-3">
                                    <div className="w-1 bg-primary animate-[bounce_1s_infinite_0ms] h-full" />
                                    <div className="w-1 bg-primary animate-[bounce_1s_infinite_200ms] h-2/3" />
                                    <div className="w-1 bg-primary animate-[bounce_1s_infinite_400ms] h-full" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isActive ? "text-primary" : "text-foreground group-hover:text-primary/80"
                              )}>
                                {ep.title || `Episode ${ep.number}`}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate max-w-[90%]">
                                {ep.description || 'Watch now in HD'}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <Search className="h-8 w-8 opacity-20" />
                        <span className="text-sm">No episodes found</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Download / Extra Card */}
              {stream?.download && (
                <div className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Offline Viewing</span>
                    <span className="text-xs text-muted-foreground">Download this episode</span>
                  </div>
                  <Link href={stream.download} target="_blank">
                    <Button variant="secondary" size="sm" className="gap-2 border border-border">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* --- Bottom Details & Comments Section --- */}
          {!isTheaterMode && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">

              {/* Left Column: Synopsis & Comments (col-span-8) */}
              <div className="lg:col-span-8 space-y-8">

                {/* Synopsis Card */}
                <div className="relative rounded-2xl border border-border bg-card/30 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {anime.genres?.map((g) => (
                      <Badge key={g} variant="outline" className="border-border hover:border-primary/50 hover:text-primary transition-colors bg-white/2">
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" /> Synopsis
                  </h3>
                  <div className={cn(
                    "relative overflow-hidden text-muted-foreground leading-relaxed transition-all duration-500",
                    isDescExpanded ? "max-h-[1000px]" : "max-h-[120px]"
                  )}>
                    <p dangerouslySetInnerHTML={{ __html: anime.description }}></p>
                    {!isDescExpanded && (
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card to-transparent pointer-events-none" />
                    )}
                  </div>
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-4 text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-1 group"
                  >
                    {isDescExpanded ? 'Read Less' : 'Read More'}
                    <ChevronRight className={cn("h-3 w-3 transition-transform", isDescExpanded && "-rotate-90")} />
                  </button>
                </div>

                {/* COMMENTS SECTION */}
                <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="text-primary h-5 w-5" />
                    <h3 className="font-bold text-lg text-foreground">Community Discussion</h3>
                    <Badge variant="outline" className="ml-auto border-border">{MOCK_COMMENTS.length} Comments</Badge>
                  </div>

                  {/* Comment Input Area */}
                  <div className="relative rounded-xl border border-border bg-card/50 overflow-hidden">
                    {IS_LOGGED_IN ? (
                      <div className="flex gap-4 p-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <textarea
                            placeholder="Share your thoughts on this episode..."
                            className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-10"
                          />
                          <div className="flex justify-end">
                            <Button size="sm" className="gap-2">Post Comment <Send className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative p-8 flex flex-col items-center justify-center text-center space-y-3">
                        {/* Blurry Background Mock */}
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" />
                        <div className="relative z-20 flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">Join the conversation</h4>
                            <p className="text-sm text-muted-foreground">Sign in to leave a comment and interact with the community.</p>
                          </div>
                          <Button variant="outline" className="gap-2 mt-2">Sign In to Comment</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mock Comments List */}
                  <div className="space-y-4">
                    {MOCK_COMMENTS.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-secondary flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                          {comment.avatar}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Info Sidebar (col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-xl p-6 shadow-xl">
                  <h3 className="font-bold text-lg mb-6 text-foreground">Anime Details</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Status", value: anime.status, icon: PlayCircle },
                      { label: "Released", value: anime.releaseDate, icon: Calendar },
                      { label: "Studio", value: anime.studios?.[0]?.name || 'Unknown', icon: Info },
                      { label: "Type", value: anime.type, icon: Star },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <item.icon className="h-4 w-4 text-primary/70" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
