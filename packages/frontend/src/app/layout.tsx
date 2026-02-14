import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://forksy.viraat.dev"),
  title: "forksy",
  description: "Swipe to discover the hottest restaurants in SF",
  applicationName: "forksy",
  keywords: ["restaurants", "san francisco", "swipe", "food", "dining", "sf"],
  authors: [{ name: "forksy" }],
  openGraph: {
    title: "forksy",
    description: "Swipe to discover the hottest restaurants in SF",
    siteName: "forksy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "forksy",
    description: "Swipe to discover the hottest restaurants in SF",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f43f5e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <div className="flex flex-col h-dvh max-w-md mx-auto bg-white">
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
