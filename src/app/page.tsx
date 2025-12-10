import HomeContent from "../components/home/HomeContent";

export const metadata = {
  title: "Premium Beauty & Skincare Store in Bangladesh",
  description: "Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands.",
  keywords: [
    "beauty store Bangladesh",
    "skincare products Dhaka",
    "makeup online Bangladesh",
    "K-beauty Bangladesh",
    "premium cosmetics",
    "beauty products online",
    "skincare routine",
    "makeup tutorial",
    "beauty tips",
    "cosmetics store"
  ],
  openGraph: {
    title: "Premium Beauty & Skincare Store in Bangladesh",
    description: "Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands.",
    images: [
      {
        url: '/images/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Scarlet - Premium Beauty & Skincare Store',
      },
    ],
  },
};

export default function Home() {
  return <HomeContent />;
}
