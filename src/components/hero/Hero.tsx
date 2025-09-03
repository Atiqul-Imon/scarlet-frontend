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



export default function Hero() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(0);
  const [dragEnd, setDragEnd] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  React.useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setAutoPlay(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const dragDistance = dragStart - dragEnd;
    const threshold = 50; // Minimum drag distance to trigger slide change
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        goToNextSlide(); // Dragged left, go to next slide
      } else {
        goToPrevSlide(); // Dragged right, go to previous slide
      }
    }
    
    setIsDragging(false);
    setDragStart(0);
    setDragEnd(0);
    
    // Resume autoplay after a delay
    setTimeout(() => setAutoPlay(true), 2000);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0]?.clientX || 0);
    setAutoPlay(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragEnd(e.touches[0]?.clientX || 0);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const dragDistance = dragStart - dragEnd;
    const threshold = 50; // Minimum drag distance to trigger slide change
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        goToNextSlide(); // Swiped left, go to next slide
      } else {
        goToPrevSlide(); // Swiped right, go to previous slide
      }
    }
    
    setIsDragging(false);
    setDragStart(0);
    setDragEnd(0);
    
    // Resume autoplay after a delay
    setTimeout(() => setAutoPlay(true), 2000);
  };

  return (
    <section className="bg-gray-50 py-0 md:py-8">
      <div className="hero-container">
        {/* Main Banner Carousel */}
        <div 
          className="relative h-[30vh] md:h-[35vh] overflow-hidden md:rounded-xl cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              <div className={`w-full h-full ${slide.backgroundColor} relative md:rounded-xl`}>
                {/* Background overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20 md:rounded-xl"></div>
                
                <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-12">
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


        </div>
      </div>


    </section>
  );
}


