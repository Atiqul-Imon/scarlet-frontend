import type { Metadata } from "next";
import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { AppProvider } from "../lib/context";
import ServiceWorkerProvider from "../components/providers/ServiceWorkerProvider";
import StickyCartButton from "../components/cart/StickyCartButton";
import FloatingWhatsAppButton from "../components/chat/FloatingWhatsAppButton";
import FloatingMessengerButton from "../components/chat/FloatingMessengerButton";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
        className={`${roboto.variable} ${playfairDisplay.variable} antialiased h-full`}
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
              {/* Separated Chat Widgets */}
              <FloatingWhatsAppButton />
              <FloatingMessengerButton />
            </div>
          </ServiceWorkerProvider>
        </AppProvider>
      </body>
    </html>
  );
}
