import Hero from "../components/hero/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
      {/* Additional sections can be added here */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Beauty Booth
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the finest collection of beauty and skincare products. From K-beauty essentials to premium international brands, we bring you authentic products at the best prices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
