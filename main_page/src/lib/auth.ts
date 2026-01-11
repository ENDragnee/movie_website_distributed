import { headers } from "next/headers";

// Define the Session types based on your Auth Service schema
export interface Session {
  user: {
    id: string;
    email: string;
    emailVerified?: boolean;
    name: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
    role: string; // Your custom field
  };
  session: {
    id: string;
    userId?: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
}

export async function getSession(): Promise<Session | null> {
  if (process.env.NODE_ENV === 'development') {
    return {
      user: {
        id: "HUxrqJA0kK9w4cOFwOdzR66k4KFj6mKO", // Use an ID that matches your Django DB for testing
        name: "spline",
        email: "spline@mail.com",
        role: "User",
        image: "/images/avatar.png",
      },
      session: {
        id: "doDpadxvMdOCWDVDZHv2vtBD9gYi8bJk",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }
    };
  }
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  // If there's no cookie, don't bother fetching
  if (!cookie) return null;

  try {
    // INTERNAL_AUTH_URL should be "http://auth-service:3000" in K8s
    // We hit the specific endpoint BetterAuth exposes for session checking
    const res = await fetch(
      `${process.env.INTERNAL_AUTH_URL}/api/auth/get-session`,
      {
        method: "GET",
        headers: {
          // Forward the cookie so the Auth Service knows who we are
          cookie: cookie,
          "Content-Type": "application/json",
        },
        cache: "no-store", // Never cache auth status
      },
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch session from Auth Service:", error);
    return null;
  }
}
