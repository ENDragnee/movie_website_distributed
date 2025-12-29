import type { User } from "@/lib/types/user"

export const MOCK_USER: User = {
  id: "1",
  name: "Alex Turner",
  email: "alex.turner@example.com",
  avatar: "https://avatar.vercel.sh/alex?size=200",
  favoriteGenres: ["Action", "Sci-Fi", "Drama"],
  watchlistCount: 24,
  watchedCount: 156,
}
