"use client";

import axios from "axios";
import { z } from "zod";
import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux" // No longer needed for manual updates
import { passwordSchema } from "@/lib/schemas/password-schema";
import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/services/use-service";

// NEW IMPORTS
import { useUser } from "@/hooks/useUser"; // Your new custom hook

export function useAccountPage() {
  // 1. Get user from our smart hook
  const { user, updateProfile, isUpdating } = useUser();

  // ===== UI STATE =====
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ===== PROFILE STATE =====
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    favoriteGenres: [] as string[],
  });

  const [avatar, setAvatar] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // ===== PASSWORD STATE =====
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  // ===== SYNC FORM WITH USER =====
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        email: user.email ?? "",
        favoriteGenres: user.favoriteGenres ?? [],
      });
      setAvatar(user.image ?? user.image_url ?? "");
    }
  }, [user]);

  // ... (Keep handleInputChange, handleGenreToggle, handleAvatarUpload as they were) ...
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      let finalImageKey = user.image_url; // Default to existing

      // 1. Handle File Upload (Matches your existing logic)
      if (uploadedFile) {
        const { data } = await axios.post(
          `${API_URL}/api/accounts/upload_image/`,
          {
            file_name: uploadedFile.name,
          },
        );

        await fetch(data.uploadUrl, {
          method: "PUT",
          body: uploadedFile,
          headers: { "Content-Type": uploadedFile.type },
        });

        finalImageKey = data.minioKey;
      }

      // 2. Execute the TanStack Mutation
      await updateProfile({
        id: user.id,
        name: formData.name,
        email: formData.email,
        image_url: finalImageKey,
        favoriteGenres: formData.favoriteGenres, // Added back since you have it in formData
      });

      // 3. UI Success flow
      setIsEditing(false);
      setUploadPreview(null); // Clear preview after successful upload
      setNotification({
        type: "success",
        message: "Account updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setNotification({ type: "error", message: "Failed to update account." });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // ... (Keep handleCancel, handlePasswordChange, handlePasswordSubmit as they were) ...
  const handleCancel = () => {
    setFormData({
      name: user?.name ?? "",
      email: user?.email ?? "",
      favoriteGenres: user?.favoriteGenres ?? [],
    });
    setUploadPreview(null);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (Keep your existing password logic) ...
    try {
      passwordSchema.parse(passwordForm);
      setPasswordErrors({});
      // setIsSaving(true) // You can use local state or reuse `isUpdating` logic

      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setNotification({
          type: "error",
          message: error.message || "Unknown error",
        });
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setNotification({
        type: "success",
        message: "Password changed successfully!",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = String(issue.path[0]);
          errors[key] = issue.message;
        });
        setPasswordErrors(errors);
      } else {
        setNotification({
          type: "error",
          message: "Failed to change password.",
        });
      }
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return {
    user,
    isEditing,
    isSaving: isUpdating, // Map the mutation loading state here
    notification,
    formData,
    avatar,
    uploadPreview,
    passwordForm,
    passwordErrors,
    setIsEditing,
    handleInputChange,
    handleGenreToggle,
    handleAvatarUpload,
    handleSave,
    handleCancel,
    handlePasswordChange,
    handlePasswordSubmit,
  };
}

