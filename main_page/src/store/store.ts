// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/player-slice";
import authReducer from "./slices/auth-slice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;