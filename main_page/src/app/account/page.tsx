"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { z } from "zod"
import { passwordSchema } from "@/lib/schemas/password-schema"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setSession } from "@/store/slices/auth-slice"
import { AccountHeader } from "@/components/account/account-header"
import { NotificationToast } from "@/components/account/notification-toast"
import { ProfileForm } from "@/components/account/profile-form"
import { PasswordForm } from "@/components/account/password-form"
import { GenresSection } from "@/components/account/genres-section"
import { ActivityStats } from "@/components/account/activity-stats"
import { authClient } from "@/lib/auth-client"

export default function AccountPage() {
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    favoriteGenres: user?.favoriteGenres ?? [],
  })

  const [avatar, setAvatar] = useState(user?.avatar ?? "")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  // Keep local form state in sync if the store user changes (session sync)
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, favoriteGenres: user.favoriteGenres ?? [] })
      setAvatar(user.avatar ?? "")
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }))
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (uploadPreview) {
        setAvatar(uploadPreview)
        setUploadPreview(null)
      }

      // Persist name/email/avatar/favoriteGenres back to the Redux store
      const updatedUser = {
        ...(user ?? { id: "", name: "", email: "" }),
        name: formData.name,
        email: formData.email,
        avatar: uploadPreview ? uploadPreview : avatar,
        favoriteGenres: formData.favoriteGenres,
        watchlistCount: user?.watchlistCount ?? 0,
        watchedCount: user?.watchedCount ?? 0,
      }
      dispatch(setSession(updatedUser))

      setIsEditing(false)
      setNotification({ type: "success", message: "Account updated successfully!" })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      setNotification({ type: "error", message: "Failed to update account. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: user?.name ?? "", email: user?.email ?? "", favoriteGenres: user?.favoriteGenres ?? [] })
    setUploadPreview(null)
    setIsEditing(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordErrors({
        currentPassword: !passwordForm.currentPassword ? "Current password is required" : "",
        newPassword: !passwordForm.newPassword ? "New password is required" : "",
        confirmPassword: !passwordForm.confirmPassword ? "Please confirm your password" : "",
      })
      return
    }

    try {
      passwordSchema.parse(passwordForm)
      setPasswordErrors({})
      setIsSaving(true)

      const {data, error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      })

      if (error) {
      setNotification({ type: "error", message: error.message || "Failed to change password." });
      return;
      }

      // 3. Success logic
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotification({ type: "success", message: "Password changed successfully!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const key = String(err.path?.[0] ?? "")
          if (key) {
            errors[key] = err.message
          }
        })
        setPasswordErrors(errors)
      }
      setNotification({ type: "error", message: "Failed to change password. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AccountHeader isEditing={isEditing} onEdit={() => setIsEditing(true)} />

      {notification && <NotificationToast type={notification.type} message={notification.message} />}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm
              isEditing={isEditing}
              isSaving={isSaving}
              formData={formData}
              uploadPreview={uploadPreview}
              avatar={avatar}
              onInputChange={handleInputChange}
              onAvatarUpload={handleAvatarUpload}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
            />

            <GenresSection
              isEditing={isEditing}
              selectedGenres={formData.favoriteGenres}
              onGenreToggle={handleGenreToggle}
            />

            <PasswordForm
              isSaving={isSaving}
              passwordForm={passwordForm}
              passwordErrors={passwordErrors}
              onPasswordChange={handlePasswordChange}
              onPasswordSubmit={handlePasswordSubmit}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ActivityStats
              user={{
                id: user?.id ?? "",
                name: user?.name ?? "",
                email: user?.email ?? "",
                avatar: user?.avatar ?? avatar,
                favoriteGenres: user?.favoriteGenres ?? formData.favoriteGenres,
                watchlistCount: user?.watchlistCount ?? 0,
                watchedCount: user?.watchedCount ?? 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
