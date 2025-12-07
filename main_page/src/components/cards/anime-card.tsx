import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface AnimeCardProps {
  id: number;
  title: string;
  image: string;
  score: number;
}

export default function AnimeCard({ id, title, image, score }: AnimeCardProps) {
  return (
    <Link href={`/watch/${id}`} className="group relative overflow-hidden rounded-lg bg-card transition-all hover:scale-105 hover:ring-2 hover:ring-primary">
      <div className="aspect-[2/3] w-full relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="fill-primary text-primary h-12 w-12" />
        </div>
        <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded">
          {score}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate text-foreground">{title}</h3>
      </div>
    </Link>
  );
}
