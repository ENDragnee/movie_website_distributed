'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTheme } from 'next-themes';
import {
  Ghost, Search, Heart, Bell, User, LogOut,
  Settings, Sun, Moon, Menu, X, ChevronDown
} from 'lucide-react';
import { RootState } from '@/store/store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for custom dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const watchListCount = useSelector((state: RootState) => state.player.watchList.length);

  // Prevent hydration mismatch for theme icons
  useEffect(() => {
    // We use setTimeout to push this to the next tick, avoiding the "synchronous update" linter error
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Trending', href: '/trending' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* --- Logo --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
            <Ghost className="h-5 w-5 text-primary transition-transform group-hover:scale-110 group-hover:-rotate-12" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            Dracula<span className="text-primary">Stream</span>
          </span>
        </Link>

        {/* --- Desktop Navigation --- */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-primary shadow-[0_0_10px_-5px_var(--color-primary)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* --- Right Actions --- */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Search (Icon Only for now) */}
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors">
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted ? (
              theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 bg-white/10 rounded-full animate-pulse" />
            )}
          </button>

          {/* Watchlist */}
          <Link href="/watchlist" className="relative p-2 text-muted-foreground hover:text-secondary hover:bg-white/5 rounded-full transition-colors group">
            <Heart className={cn("h-5 w-5 transition-transform group-hover:scale-110", watchListCount > 0 && "fill-secondary text-secondary")} />
            {watchListCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
            )}
          </Link>

          {/* Account Bubble (Custom Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)} // Delay to allow clicks inside
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group"
            >
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary to-secondary p-0.5">
                <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {/* Fallback Avatar */}
                  <span className="font-bold text-xs text-primary">DS</span>
                </div>
              </div>
              <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", isProfileOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            <div className={cn(
              "absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-card shadow-xl backdrop-blur-xl transition-all duration-200 z-50",
              isProfileOpen
                ? "transform opacity-100 scale-100 translate-y-0"
                : "transform opacity-0 scale-95 -translate-y-2 pointer-events-none"
            )}>
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-medium text-foreground">Guest User</p>
                <p className="text-xs text-muted-foreground truncate">guest@draculastream.com</p>
              </div>
              <div className="p-1">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                  <Bell className="h-4 w-4" /> Notifications
                </button>
              </div>
              <div className="p-1 border-t border-white/5">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-white/10 p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg hover:bg-white/5 text-sm font-medium"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-2" />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">Dark Mode</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-white/5 rounded-full"
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
