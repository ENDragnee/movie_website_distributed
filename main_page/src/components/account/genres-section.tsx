"use client"

import { Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { GENRES } from "@/lib/constants/genres"

interface GenresSectionProps {
  isEditing: boolean
  selectedGenres: string[]
  onGenreToggle: (genre: string) => void
}

export function GenresSection({ isEditing, selectedGenres, onGenreToggle }: GenresSectionProps) {
  return (
    <Card className="border-border bg-card">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Favorite Genres
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => isEditing && onGenreToggle(genre)}
              disabled={!isEditing}
              className={cn(
                "px-4 py-2 rounded-full font-medium transition-all text-sm border",
                selectedGenres.includes(genre)
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 hover:bg-white/10",
                !isEditing && "cursor-default",
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
