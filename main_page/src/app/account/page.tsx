"use client"

import { useAccountPage } from "@/hooks/useAccountPage"
import { AccountHeader } from "@/components/account/account-header"
import { NotificationToast } from "@/components/account/notification-toast"
import { ProfileForm } from "@/components/account/profile-form"
import { PasswordForm } from "@/components/account/password-form"
import { GenresSection } from "@/components/account/genres-section"
import { ActivityStats } from "@/components/account/activity-stats"

export default function AccountPage() {
  const {
    user,
    isEditing,
    isSaving,
    notification,
    formData,
    avatar,
    uploadPreview,
    passwordForm,
    passwordErrors,
    setIsEditing,
    handleInputChange,
    handleAvatarUpload,
    handleGenreToggle,
    handleSave,
    handleCancel,
    handlePasswordChange,
    handlePasswordSubmit,
  } = useAccountPage()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AccountHeader isEditing={isEditing} onEdit={() => setIsEditing(true)} />

      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
  )
}
