"use client"

import axios from "axios"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { passwordSchema } from "@/lib/schemas/password-schema"
import { authClient } from "@/lib/auth-client"
import { setSession } from "@/store/slices/auth-slice"

export function useAccountPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  // ===== UI STATE =====
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // ===== PROFILE STATE =====
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    favoriteGenres: user?.favoriteGenres ?? [],
  })

  const [avatar, setAvatar] = useState(user?.image ?? "")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // ===== PASSWORD STATE =====
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // ===== SYNC WITH REDUX SESSION =====
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        favoriteGenres: user.favoriteGenres ?? [],
      })
      setAvatar(user.avatar ?? "")
    }
  }, [user])

  // ===== HANDLERS =====
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    if (!file) return

    setUploadedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setUploadPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let finalImageKey = avatar

      if (uploadedFile) {
        const { data } = await axios.post(`http://localhost:8000/api/accounts/upload-intent`, {
          fileName: uploadedFile.name
        });

        await fetch(data.uploadUrl, {
          method: 'PUT',
          body: uploadedFile,
          headers: { 'Content-Type': uploadedFile.type }
        });
        
        finalImageKey = data.minioKey;
      }

      const profilePayload = {
        name: formData.name,
        email: formData.email,
        image: finalImageKey
      }

      const response = axios.put(`http://localhost:8000/api/accounts/${user?.id}/profile/`,
        profilePayload
      );

      dispatch(setSession((await response).data));

      setIsEditing(false)
      setNotification({ type: "success", message: "Account updated successfully!" })
    } catch {
      setNotification({ type: "error", message: "Failed to update account." })
    } finally {
      setIsSaving(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name ?? "",
      email: user?.email ?? "",
      favoriteGenres: user?.favoriteGenres ?? [],
    })
    setUploadPreview(null)
    setIsEditing(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))

    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      passwordSchema.parse(passwordForm)
      setPasswordErrors({})
      setIsSaving(true)

      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        setNotification({ type: "error", message: error.message || "Unkown error from authClient!" })
        return
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setNotification({ type: "success", message: "Password changed successfully!" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const key = String(issue.path[0])
          errors[key] = issue.message
        })
        setPasswordErrors(errors)
      } else {
        setNotification({ type: "error", message: "Failed to change password." })
      }
    } finally {
      setIsSaving(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  return {
    user,

    // state
    isEditing,
    isSaving,
    notification,
    formData,
    avatar,
    uploadPreview,
    passwordForm,
    passwordErrors,

    // setters
    setIsEditing,

    // handlers
    handleInputChange,
    handleGenreToggle,
    handleAvatarUpload,
    handleSave,
    handleCancel,
    handlePasswordChange,
    handlePasswordSubmit,
  }
}
