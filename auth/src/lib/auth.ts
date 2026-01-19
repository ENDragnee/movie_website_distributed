import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // "http://auth.dracula.com"
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : ["http://dracula.com", "http://localhost:3000"],

  // --- CRITICAL FIX FOR SUBDOMAINS ---
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "dracula.com",
    },
    defaultRedirectURL: "http://dracula.com",
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
