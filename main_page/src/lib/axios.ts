import axios from "axios";

// 1. Determine the Base URL based on environment
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // SERVER-SIDE: Talk directly to the K8s Service (Internal DNS)
    // Format: http://<service-name>:<port>
    return "http://consumet-api:8000";
  } else {
    // CLIENT-SIDE: Talk to the Ingress (Reverse Proxy)
    // The ingress rewrites '/anime' -> '/'
    return "/anime";
  }
};

export const api = axios.create({
  // Append the specific route you are targeting
  baseURL: `${getBaseUrl()}/`,
  headers: {
    "Content-Type": "application/json",
  },
});
