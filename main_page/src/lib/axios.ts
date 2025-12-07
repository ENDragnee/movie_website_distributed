import axios from "axios";

// We switch to 'meta/anilist' which is much more stable than direct 'anime/gogoanime'
export const api = axios.create({
  baseURL: "http://localhost:8000/meta/anilist",
  headers: {
    "Content-Type": "application/json",
  },
});
