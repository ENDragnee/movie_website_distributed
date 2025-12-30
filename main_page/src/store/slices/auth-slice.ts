import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape based on app User model (keeps optional fields for flexibility)
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  avatar?: string;
  favoriteGenres?: string[];
  watchlistCount?: number;
  watchedCount?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setSession, logout } = authSlice.actions;
export default authSlice.reducer;
