import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { AppProvider } from "../lib/context";
import ServiceWorkerProvider from "../components/providers/ServiceWorkerProvider";
import MobileCartDebug from "../components/debug/MobileCartDebug";
import StickyCartButton from "../components/cart/StickyCartButton";
import UnifiedChatWidget from "../components/chat/UnifiedChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scarlet - Beauty & Skincare Store",
  description: "Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AppProvider>
          <ServiceWorkerProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              {/* Sticky Cart Button */}
              <StickyCartButton />
              {/* Unified Chat Widget */}
              <UnifiedChatWidget />
              {/* Mobile Cart Debug (Development Only) */}
              <MobileCartDebug />
            </div>
          </ServiceWorkerProvider>
        </AppProvider>
      </body>
    </html>
  );
}
