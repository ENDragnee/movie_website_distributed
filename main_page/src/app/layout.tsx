import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/navbar";
import { getSession } from "@/lib/auth"; // <--- The server-side fetcher we made earlier
import SessionSyncer from "@/components/auth/session-syncer"; // <--- The bridge


export const metadata: Metadata = {
  title: "Dracula Anime",
  description: "Modern Anime Streaming",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>

          <SessionSyncer session={session} />
          <Navbar />
          <main className="min-h-screen pb-20">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
