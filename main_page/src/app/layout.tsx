import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/navbar";
import { getSession } from "@/lib/auth"; // <--- The server-side fetcher we made earlier
import SessionSyncer from "@/components/auth/session-syncer"; // <--- The bridge

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Providers>

          <SessionSyncer session={session} />
          <Navbar />
          <main className="min-h-screen pb-20">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
