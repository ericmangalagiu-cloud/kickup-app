import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NameModal } from "@/components/NameModal";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KickUp — Find Your Next Game",
  description: "Join pickup football games near you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <main className="pt-16">{children}</main>
        <footer className="py-8 text-center text-sm text-zinc-500">
          KickUp · Beta · Made with ❤️
        </footer>
        <NameModal />
        <Toaster />
      </body>
    </html>
  );
}
