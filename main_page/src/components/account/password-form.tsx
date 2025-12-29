"use client"

import type React from "react"
import { Lock, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PasswordFormProps {
  isSaving: boolean
  passwordForm: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  passwordErrors: Record<string, string>
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordSubmit: (e: React.FormEvent) => Promise<void>
}

export function PasswordForm({
  isSaving,
  passwordForm,
  passwordErrors,
  onPasswordChange,
  onPasswordSubmit,
}: PasswordFormProps) {
  return (
    <Card className="border-border bg-card">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Change Password
        </h2>

        <form onSubmit={onPasswordSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
              className={cn(
                "w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 transition-colors",
                passwordErrors.currentPassword
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-input focus:ring-primary/50",
              )}
              placeholder="Enter current password"
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
              className={cn(
                "w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 transition-colors",
                passwordErrors.newPassword
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-input focus:ring-primary/50",
              )}
              placeholder="Enter new password (min 8 characters)"
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
              className={cn(
                "w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 transition-colors",
                passwordErrors.confirmPassword
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-input focus:ring-primary/50",
              )}
              placeholder="Confirm your new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
            }
            className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_15px_-5px_var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </Card>
  )
}
