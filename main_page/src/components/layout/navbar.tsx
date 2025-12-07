'use client';
import Link from 'next/link';
import { Ghost, Search, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function Navbar() {
  const watchListCount = useSelector((state: RootState) => state.player.watchList.length);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:text-primary/80 transition">
          <Ghost className="h-6 w-6" />
          <span>DraculaStream</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition">Home</Link>
          <Link href="/trending" className="text-sm font-medium hover:text-primary transition">Trending</Link>
          <Link href="/schedule" className="text-sm font-medium hover:text-primary transition">Schedule</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition">
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <div className="relative">
            <Heart className="h-5 w-5 text-secondary" />
            {watchListCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                {watchListCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
