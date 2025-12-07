'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import AnimeCard from '@/components/cards/anime-card';
import { Loader2 } from 'lucide-react';

interface Anime {
  mal_id: number;
  title: string;
  title_english: string;
  images: {
    webp: {
      large_image_url: string;
    }
  };
  score: number;
}

// Fetcher function
const fetchTopAnime = async () => {
  const { data } = await api.get('/top/anime?limit=12');
  return data.data;
};

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['topAnime'],
    queryFn: fetchTopAnime,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-20 text-destructive">Failed to load anime</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Trending Now
        </h1>
        <p className="text-muted-foreground mt-2">Top rated anime this season</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data?.map((anime: Anime) => (
          <AnimeCard
            key={anime.mal_id}
            id={anime.mal_id}
            title={anime.title_english || anime.title}
            image={anime.images.webp.large_image_url}
            score={anime.score}
          />
        ))}
      </div>
    </div>
  );
}

