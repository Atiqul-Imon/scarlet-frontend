import Hero from "../components/hero/Hero";
import ProductShowcase from "../components/products/ProductShowcase";
import BrandShowcase from "../components/brands/BrandShowcase";

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
  return (
    <div className="bg-gradient-to-br from-rose-50 to-rose-100">
      <Hero />
      
      {/* Category Section (previously Brand Showcase) */}
      <BrandShowcase />
      
      {/* New Arrivals */}
      <ProductShowcase 
        title="New Arrivals"
        subtitle="Discover our latest beauty essentials"
        category="new"
        viewAllLink="/products?filter=new"
        limit={30}
      />
      
      {/* Coming Soon */}
      <ProductShowcase 
        title="Coming Soon"
        subtitle="Get ready for exciting new products"
        category="coming-soon"
        viewAllLink="/products?filter=coming-soon"
        limit={30}
      />
      
      {/* Skincare Section */}
      <ProductShowcase 
        title="Skincare Essentials"
        subtitle="Nourish and protect your skin"
        category="skincare-essentials"
        viewAllLink="/products?filter=skincare-essentials"
        limit={30}
      />
      
      {/* Makeup Section */}
      <ProductShowcase 
        title="Makeup Collection"
        subtitle="Enhance your natural beauty"
        category="makeup-collection"
        viewAllLink="/products?filter=makeup-collection"
        limit={30}
      />
    </div>
  );
}
