"use client"

import type React from "react"
import Image from "next/image"
import { Upload, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ProfileFormProps {
  isEditing: boolean
  isSaving: boolean
  formData: {
    name: string
    email: string
  }
  uploadPreview: string | null
  avatar: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: () => void
  onSave: () => Promise<void>
  onCancel: () => void
}

export function ProfileForm({
  isEditing,
  isSaving,
  formData,
  uploadPreview,
  avatar,
  onInputChange,
  onAvatarUpload,
  onEdit,
  onSave,
  onCancel,
}: ProfileFormProps) {
  return (
    <Card className="border-border bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-all hover:shadow-[0_0_10px_-5px_var(--color-primary)]"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Avatar Section */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Display */}
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/30 bg-muted">
                <Image src={uploadPreview || avatar} alt="Profile" fill className="object-cover" />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <Upload className="h-4 w-4 text-primary-foreground" />
                  <input type="file" accept="image/*" onChange={onAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Avatar Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">{formData.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{formData.email}</p>
              {isEditing && uploadPreview && (
                <p className="text-xs text-primary">New image selected (click save to confirm)</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        {isEditing ? (
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_15px_-5px_var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-full bg-white/5 text-foreground font-medium text-sm border border-white/10 transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display View */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-foreground font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email Address</p>
              <p className="text-foreground font-medium">{formData.email}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
