// store/slices/playerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  isTheaterMode: boolean;
  currentEpisodeId: string | null; // Changed from Index to ID
  watchList: string[]; // Changed from number[] to string[]
  autoPlay: boolean;
}

const initialState: PlayerState = {
  isTheaterMode: false,
  currentEpisodeId: null,
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
    setCurrentEpisodeId: (state, action: PayloadAction<string>) => {
      state.currentEpisodeId = action.payload;
    },
    addToWatchList: (state, action: PayloadAction<string>) => {
      if (!state.watchList.includes(action.payload)) {
        state.watchList.push(action.payload);
      }
    },
    removeFromWatchList: (state, action: PayloadAction<string>) => {
      state.watchList = state.watchList.filter((id) => id !== action.payload);
    },
  },
});

export const {
  toggleTheaterMode,
  toggleAutoPlay,
  setCurrentEpisodeId,
  addToWatchList,
  removeFromWatchList,
} = playerSlice.actions;

export default playerSlice.reducer;
