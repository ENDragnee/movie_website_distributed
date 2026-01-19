// hooks/useUser.ts
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "@/services/use-service";

export function useUser() {
  const queryClient = useQueryClient();
  const { user: sessionUser, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 1. Fetch Profile Data
  const { data: apiProfile, isLoading, error } = useQuery({
    queryKey: ["user-profile", sessionUser?.id],
    queryFn: () => fetchProfile(sessionUser!.id),
    enabled: !!sessionUser?.id, // Only run if we have an ID
    staleTime: 1000 * 60 * 5,    // 5 minutes
  });

  // 2. Mutation for updating profile (Replaces useUpdateProfileMutation)
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedData) => {
      // Manually update the cache so the UI updates instantly
      queryClient.setQueryData(["user-profile", sessionUser?.id], updatedData);
    },
  });

  // 3. THE FIX: Stabilize the merged object
  const user = useMemo(() => {
    if (!sessionUser) return null;

    // Merge session and API data
    const merged = { 
      ...sessionUser, 
      ...apiProfile 
    };

    // Normalize image mapping
    if (merged.image_url) {
      merged.image = merged.image_url;
    }

    return merged;
  }, [sessionUser, apiProfile]); // ONLY re-calculates if these specific objects change

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}