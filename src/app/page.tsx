import Hero from "../components/hero/Hero";
import ProductShowcase from "../components/products/ProductShowcase";
import BrandShowcase from "../components/brands/BrandShowcase";
import CategorySection from "../components/categories/CategorySection";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      
      {/* Category Section */}
      <CategorySection />
      
      {/* Brand Showcase */}
      <BrandShowcase />
      
      {/* New Arrivals */}
      <ProductShowcase 
        title="New Arrivals"
        subtitle="Discover our latest beauty essentials"
        category="new"
        viewAllLink="/products?filter=new"
      />
      
      {/* Best Selling */}
      <ProductShowcase 
        title="Best Selling"
        subtitle="Customer favorites that deliver results"
        category="bestselling"
        viewAllLink="/products?filter=bestselling"
      />
      
      {/* Skincare Section */}
      <ProductShowcase 
        title="Skincare Essentials"
        subtitle="Nourish and protect your skin"
        category="skincare"
        viewAllLink="/skincare"
      />
      
      {/* Makeup Section */}
      <ProductShowcase 
        title="Makeup Collection"
        subtitle="Enhance your natural beauty"
        category="makeup"
        viewAllLink="/makeup"
      />
      
      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
        <div className="container-herlan">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Stay Beautiful with Scarlet
            </h2>
            <p className="text-gray-600 mb-8">
              Get the latest beauty tips, exclusive offers, and new product announcements delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
              />
              <button className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
