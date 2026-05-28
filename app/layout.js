import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata = {
  title: "LernLang - Belajar Bahasa Inggris Interaktif & AI Correction",
  description:
    "Platform pembelajaran bahasa Inggris interaktif dengan AI evaluation, gamification, dan community learning. Belajar grammar, vocabulary, pronunciation dengan cara yang menyenangkan.",
  keywords: [
    "belajar bahasa inggris",
    "english learning",
    "AI correction",
    "grammar checker",
    "english app",
    "vocabulary",
  ],
  authors: [{ name: "LernLang Team" }],
  creator: "LernLang",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://learnlang.web.id",
    title: "LernLang - Belajar Bahasa Inggris Interaktif",
    description:
      "Platform pembelajaran bahasa Inggris dengan AI evaluation dan gamification",
    siteName: "LernLang",
  },
  twitter: {
    card: "summary_large_image",
    title: "LernLang - Belajar Bahasa Inggris",
    description: "Platform pembelajaran interaktif dengan AI correction",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://learnlang.web.id",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
