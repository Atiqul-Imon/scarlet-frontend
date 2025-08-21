"use client";
import * as React from 'react';
import Link from 'next/link';

interface BannerSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  backgroundColor: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Monsoon Sale",
    subtitle: "Up to 50% Off",
    description: "Get the best deals on skincare and beauty products this monsoon season",
    buttonText: "Shop Now",
    buttonLink: "/sale/monsoon",
    backgroundImage: "/hero/monsoon-sale.jpg",
    backgroundColor: "bg-gradient-to-r from-pink-500 to-purple-600"
  },
  {
    id: 2,
    title: "J-Beauty Collection",
    subtitle: "Authentic Japanese Beauty",
    description: "Discover the secrets of Japanese skincare with our curated collection",
    buttonText: "Explore J-Beauty",
    buttonLink: "/j-beauty",
    backgroundImage: "/hero/j-beauty.jpg",
    backgroundColor: "bg-gradient-to-r from-rose-400 to-pink-500"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Fresh & Trending",
    description: "Be the first to try the latest beauty innovations and trending products",
    buttonText: "See New Items",
    buttonLink: "/new",
    backgroundImage: "/hero/new-arrivals.jpg",
    backgroundColor: "bg-gradient-to-r from-purple-500 to-indigo-600"
  }
];

const categoryHighlights = [
  { name: "Hair Care", icon: "💇‍♀️", link: "/bath-body/hair-care" },
  { name: "Serum", icon: "✨", link: "/skincare/serum" },
  { name: "Essences", icon: "💧", link: "/skincare/essences" },
  { name: "Cleansers", icon: "🧼", link: "/skincare/cleansers" },
  { name: "Toner", icon: "🌸", link: "/skincare/toners" },
  { name: "Moisturizers", icon: "🌿", link: "/skincare/moisturizers" },
  { name: "Exfoliators", icon: "✨", link: "/skincare/exfoliators" },
  { name: "Sun Protection", icon: "☀️", link: "/skincare/sun-protection" }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="w-full">
      {/* Main Banner Carousel */}
      <div className="relative h-[30vh] md:h-[35vh] overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`w-full h-full ${slide.backgroundColor} relative`}>
              {/* Background overlay for better text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
              
              <div className="relative z-10 h-full flex items-center">
                <div className="container-herlan w-full">
                  <div className="max-w-xl">
                    {slide.subtitle && (
                      <p className="text-white/90 text-base md:text-lg lg:text-xl font-medium mb-2">
                        {slide.subtitle}
                      </p>
                    )}
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-white/90 text-sm md:text-base lg:text-lg mb-6 leading-relaxed">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.buttonLink}
                      className="inline-block bg-white text-gray-900 px-4 md:px-6 lg:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base lg:text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => goToSlide(currentSlide === 0 ? bannerSlides.length - 1 : currentSlide - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-300"
          aria-label="Next slide"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Category Highlights */}
      <div className="bg-white py-8">
        <div className="container-herlan">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
            {categoryHighlights.map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="flex flex-col items-center p-2 md:p-4 rounded-lg hover:bg-pink-50 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-lg md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700 text-center group-hover:text-pink-600 transition-colors duration-300">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
