// services/user-service.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api/accounts";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  image_url?: string;
  favoriteGenres?: string[];
}

export const fetchProfile = async (userId: string): Promise<UserProfile> => {
  const { data } = await axios.get(`${API_URL}/${userId}/profile/`);
  return data;
};

export const updateProfile = async ({ id, ...patch }: Partial<UserProfile> & { id: string }) => {
  const { data } = await axios.put(`${API_URL}/${id}/update_profile/`, patch);
  return data;
};