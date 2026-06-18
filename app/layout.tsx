import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { NameModal } from "@/components/NameModal";
import { InstructionsModal } from "@/components/InstructionsModal";
import { CookieBanner } from "@/components/CookieBanner";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { CursorTrail } from "@/components/CursorTrail";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KickUp — Fotbal de cartier în România",
  description: "Organizează și alătură-te meciurilor de fotbal pickup din România.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16a34a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        {/* pt-16 = navbar height; pb-16 on mobile = bottom nav height */}
        <main className="pt-16 pb-16 md:pb-0"><PageTransition>{children}</PageTransition></main>
        <BottomNav />
        <NameModal />
        <InstructionsModal />
        <CookieBanner />
        <Toaster />
        <CursorTrail />
      </body>
    </html>
  );
}
