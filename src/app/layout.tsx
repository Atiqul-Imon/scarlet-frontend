import type { Metadata } from "next";
import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { AppProvider } from "../lib/context";
import ClientSearchProvider from "../components/providers/ClientSearchProvider";
import ServiceWorkerProvider from "../components/providers/ServiceWorkerProvider";
import { SWRProvider } from "../components/providers/SWRProvider";
import StickyCartButton from "../components/cart/StickyCartButton";
import FloatingWhatsAppButton from "../components/chat/FloatingWhatsAppButton";
import FloatingMessengerButton from "../components/chat/FloatingMessengerButton";
import { ChatProvider } from "../lib/chat-context";
import ChatWidget from "../components/chat/ChatWidget";
import StructuredData from "../components/seo/StructuredData";
import ConditionalLayout from "../components/layout/ConditionalLayout";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Scarlet - Premium Beauty & Skincare Store",
    template: "%s | Scarlet"
  },
  description: "Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands. Free delivery in Dhaka, Bangladesh.",
  keywords: [
    "beauty",
    "skincare", 
    "makeup",
    "cosmetics",
    "K-beauty",
    "premium beauty",
    "Bangladesh",
    "Dhaka",
    "online beauty store",
    "beauty products",
    "skincare routine",
    "makeup tutorial",
    "beauty tips"
  ],
  authors: [{ name: "Scarlet Team" }],
  creator: "Scarlet",
  publisher: "Scarlet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://scarletunlimited.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Scarlet',
    title: 'Scarlet - Premium Beauty & Skincare Store',
    description: 'Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands. Free delivery in Dhaka, Bangladesh.',
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Scarlet - Premium Beauty & Skincare Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ScarletBeauty',
    creator: '@ScarletBeauty',
    title: 'Scarlet - Premium Beauty & Skincare Store',
    description: 'Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands. Free delivery in Dhaka, Bangladesh.',
    images: ['/images/og-home.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'],
    yandex: process.env['NEXT_PUBLIC_YANDEX_VERIFICATION'],
    yahoo: process.env['NEXT_PUBLIC_BING_SITE_VERIFICATION'],
  },
  other: {
    'fb:app_id': process.env['NEXT_PUBLIC_FACEBOOK_APP_ID'] || '',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#dc2626" />
        <StructuredData type="organization" />
        <StructuredData type="localBusiness" />
      </head>
      <body
        className={`${roboto.variable} ${playfairDisplay.variable} antialiased h-full`}
      >
        <SWRProvider>
          <AppProvider>
            <ClientSearchProvider>
              <ChatProvider>
                <ServiceWorkerProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </ServiceWorkerProvider>
              </ChatProvider>
            </ClientSearchProvider>
          </AppProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
