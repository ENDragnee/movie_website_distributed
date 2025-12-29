import { Card } from "@/components/ui/card"
import type { User } from "@/lib/types/user"

interface ActivityStatsProps {
  user: User
}

export function ActivityStats({ user }: ActivityStatsProps) {
  return (
    <Card className="border-border bg-card">
      <div className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Watch Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Watched</span>
            <span className="font-bold text-foreground">{user.watchedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">In Watchlist</span>
            <span className="font-bold text-foreground">{user.watchlistCount}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
