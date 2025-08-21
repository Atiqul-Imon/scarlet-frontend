import Hero from "../components/hero/Hero";

export default function Home() {
  return (
    <div className="section-full-vh bg-gray-50">
      <Hero />
      
      {/* Additional sections can be added here */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container-herlan">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Welcome to Scarlet
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 mx-auto">
              Discover the finest collection of beauty and skincare products. From K-beauty essentials to premium international brands, we bring you authentic products at the best prices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
