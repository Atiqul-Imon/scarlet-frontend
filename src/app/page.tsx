import Hero from "../components/hero/Hero";
import ProductShowcase from "../components/products/ProductShowcase";
import BrandShowcase from "../components/brands/BrandShowcase";
import { ResponsiveFlex } from "../components/layout";

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
    <div className="bg-white">
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
        viewAllLink="/skincare"
        limit={30}
      />
      
      {/* Makeup Section */}
      <ProductShowcase 
        title="Makeup Collection"
        subtitle="Enhance your natural beauty"
        category="makeup-collection"
        viewAllLink="/makeup"
        limit={30}
      />
      
      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-red-50 to-purple-50">
        <div className="container-herlan py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="responsive-heading text-gray-900 mb-4">
              Stay Beautiful with Scarlet
            </h2>
            <p className="responsive-text text-gray-600 mb-8">
              Get the latest beauty tips, exclusive offers, and new product announcements delivered to your inbox.
            </p>
            <ResponsiveFlex
              direction={{ default: 'col', sm: 'row' }}
              align="center"
              justify="center"
              gap="md"
              className="max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400 w-full"
              />
              <button className="bg-red-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 w-full sm:w-auto">
                Subscribe
              </button>
            </ResponsiveFlex>
          </div>
        </div>
      </section>
    </div>
  );
}
