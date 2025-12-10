import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // In K8s, this points to the public domain (handled by Ingress)
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://auth.dracula.com",

  // Type definition to match your server config
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
});

// Helper hooks for ease of use
export const { useSession, signIn, signOut, signUp } = authClient;
