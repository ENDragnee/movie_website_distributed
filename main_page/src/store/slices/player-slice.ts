// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  isTheaterMode: boolean;
  currentEpisodeIndex: number; // Index in the episode list
  watchList: number[]; // Anime IDs
  autoPlay: boolean;
}

const initialState: PlayerState = {
  isTheaterMode: false,
  currentEpisodeIndex: 0,
  watchList: [],
  autoPlay: true,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    toggleTheaterMode: (state) => {
      state.isTheaterMode = !state.isTheaterMode;
    },
    toggleAutoPlay: (state) => {
      state.autoPlay = !state.autoPlay;
    },
    setEpisode: (state, action: PayloadAction<number>) => {
      state.currentEpisodeIndex = action.payload;
    },
    addToWatchList: (state, action: PayloadAction<number>) => {
      if (!state.watchList.includes(action.payload)) {
        state.watchList.push(action.payload);
      }
    },
    removeFromWatchList: (state, action: PayloadAction<number>) => {
      state.watchList = state.watchList.filter((id) => id !== action.payload);
    },
  },
});

export const {
  toggleTheaterMode,
  toggleAutoPlay,
  setEpisode,
  addToWatchList,
  removeFromWatchList,
} = playerSlice.actions;

export default playerSlice.reducer;
