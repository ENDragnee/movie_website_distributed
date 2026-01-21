'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Loader2, Check, ChevronRight, ChevronLeft,
  Languages, Signal, Captions // New Icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subtitle {
  url: string;
  lang: string;
}

interface HLSPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  currentAudio?: 'sub' | 'dub';
  onAudioChange?: (type: 'sub' | 'dub') => void;
  subtitles?: Subtitle[];
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  name: string;
}

export default function HLSPlayer({
  src,
  poster,
  autoPlay = false,
  currentAudio = 'sub',
  onAudioChange,
  subtitles = []
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Progress State ---
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- Settings State ---
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'quality' | 'subtitles'>('main');

  // --- Quality & Subtitle State ---
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1); // -1 is Off, otherwise index in subtitles array

  // Helper: Format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return hh ? `${hh}:${mm.toString().padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
  };

  // --- Initialize HLS ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset state for new video
    const resetTimer = setTimeout(() => {
      setIsLoading(true);
      setQualities([]);
      setCurrentQuality(-1);
      // Default to first subtitle if available, or off (-1)
      setCurrentSubtitle(subtitles.length > 0 ? 0 : -1);
      setIsPlaying(false);
    }, 0);

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();

      hls = new Hls({
        xhrSetup: (xhr) => { xhr.withCredentials = false; },
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const levels = data.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : 'Unknown'
        }));
        setQualities(levels.sort((a, b) => b.height - a.height));

        if (autoPlay) {
          video.play().catch((err) => console.warn("Autoplay prevented:", err));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS Fatal:", data);
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => { });
      });
    }

    return () => {
      clearTimeout(resetTimer);
      if (hls) hls.destroy();
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src, autoPlay, subtitles]); // Added subtitles to dependency to reset default

  // --- Handlers ---

  const handleQualityChange = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
      setSettingsView('main'); // Go back to main menu instead of closing
    }
  };

  const handleSubtitleChange = (index: number) => {
    setCurrentSubtitle(index);
    // Native track switching logic is handled by React rendering the <track> elements with 'default' prop
    // However, changing 'default' prop dynamically doesn't always update active track instantly in all browsers.
    // We force update the video textTracks mode.
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        // Match index. Note: tracks order matches <track> tag order.
        tracks[i].mode = (i === index) ? 'showing' : 'hidden';
      }
    }
    setSettingsView('main');
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(curr);
      setDuration(dur);
      if (dur > 0) setProgress((curr / dur) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  return (
    <div ref={containerRef} className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl">

      {/* --- Loading Spinner --- */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* --- Video Element --- */}
      <video
        ref={videoRef}
        poster={poster}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      >
        {/* Render Subtitles Tracks */}
        {subtitles.map((sub, index) => (
          <track
            key={index}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang.substring(0, 2).toLowerCase()}
            label={sub.lang}
            default={index === currentSubtitle}
          />
        ))}
      </video>

      {/* --- Big Play Button --- */}
      {!isPlaying && !isLoading && !showSettings && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 pl-1 text-black shadow-[0_0_30px_-5px_var(--color-primary)] transition-transform hover:scale-110 hover:bg-primary"
          >
            <Play className="h-8 w-8 fill-current" />
          </button>
        </div>
      )}

      {/* --- Settings Menu (Overlay) --- */}
      {showSettings && (
        <div className="absolute bottom-16 right-4 z-40 w-64 overflow-hidden rounded-lg border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          {settingsView === 'main' ? (
            <div className="flex flex-col gap-1">
              {/* Quality Menu Trigger */}
              <button
                onClick={() => setSettingsView('quality')}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4" /> Quality
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  {currentQuality === -1 ? 'Auto' : qualities.find(q => q.index === currentQuality)?.name}
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>

              {/* Subtitles Menu Trigger */}
              {subtitles.length > 0 && (
                <button
                  onClick={() => setSettingsView('subtitles')}
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Captions className="h-4 w-4" /> Subtitles
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs truncate max-w-[80px]">
                    {currentSubtitle === -1 ? 'Off' : subtitles[currentSubtitle]?.lang}
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              )}

              {/* Audio Toggle Trigger */}
              {onAudioChange && (
                <button
                  onClick={() => {
                    const newAudio = currentAudio === 'sub' ? 'dub' : 'sub';
                    onAudioChange(newAudio);
                    setShowSettings(false);
                  }}
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" /> Audio
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs uppercase">
                    {currentAudio} <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              )}
            </div>
          ) : settingsView === 'quality' ? (
            /* Quality Sub-Menu */
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSettingsView('main')}
                className="flex w-full items-center gap-2 border-b border-white/10 px-2 py-2 text-xs font-bold text-muted-foreground hover:text-white"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>

              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => handleQualityChange(-1)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-white/10",
                    currentQuality === -1 ? "text-primary" : "text-white"
                  )}
                >
                  <span>Auto</span>
                  {currentQuality === -1 && <Check className="h-3 w-3" />}
                </button>
                {qualities.map((q) => (
                  <button
                    key={q.index}
                    onClick={() => handleQualityChange(q.index)}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-white/10",
                      currentQuality === q.index ? "text-primary" : "text-white"
                    )}
                  >
                    <span>{q.name}</span>
                    {currentQuality === q.index && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Subtitles Sub-Menu */
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSettingsView('main')}
                className="flex w-full items-center gap-2 border-b border-white/10 px-2 py-2 text-xs font-bold text-muted-foreground hover:text-white"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>

              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => handleSubtitleChange(-1)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-white/10",
                    currentSubtitle === -1 ? "text-primary" : "text-white"
                  )}
                >
                  <span>Off</span>
                  {currentSubtitle === -1 && <Check className="h-3 w-3" />}
                </button>
                {subtitles.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubtitleChange(idx)}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-white/10",
                      currentSubtitle === idx ? "text-primary" : "text-white"
                    )}
                  >
                    <span className="truncate">{sub.lang}</span>
                    {currentSubtitle === idx && <Check className="h-3 w-3 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Bottom Controls Bar --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/90 via-black/60 to-transparent px-4 py-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

        {/* Progress Bar */}
        <div
          className="group/slider mb-4 h-1 w-full cursor-pointer rounded-full bg-white/20 hover:h-1.5 transition-all"
          onClick={handleSeek}
        >
          <div
            className="relative h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute -right-1.5 -top-1 h-3 w-3 scale-0 rounded-full bg-white transition-transform group-hover/slider:scale-100" />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-primary transition">
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
            </button>

            <div className="group/vol flex items-center gap-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="text-white hover:text-primary transition"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            <span className="text-xs font-mono text-white/80 select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Indicator */}
            {currentAudio && (
              <div className="hidden sm:flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                {currentAudio}
              </div>
            )}

            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setSettingsView('main');
              }}
              className={cn("transition", showSettings ? "text-primary rotate-45" : "text-white hover:text-primary")}
            >
              <Settings size={20} />
            </button>

            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
