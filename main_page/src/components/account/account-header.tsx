interface AccountHeaderProps {
  isEditing: boolean
  onEdit: () => void
}

export function AccountHeader({ isEditing, onEdit }: AccountHeaderProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <div className="text-sm text-muted-foreground">Manage your profile and preferences</div>
        </div>
      </div>
    </div>
  )
}
