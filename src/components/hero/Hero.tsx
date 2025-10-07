"use client";
import * as React from 'react';
import Image from 'next/image';

interface BannerSlide {
  id: number;
  title: string;
  backgroundImage: {
    mobileSmall: string;    // 320x200px
    mobileLarge: string;    // 480x300px
    tabletSmall: string;    // 768x400px
    tabletLarge: string;    // 1024x500px
    desktopSmall: string;   // 1200x600px
    desktopLarge: string;   // 1920x800px
  };
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Beauty Collection",
    backgroundImage: {
      mobileSmall: "/images/hero/newhero01mobile.webp",        // 320x200px
      mobileLarge: "/images/hero/newhero01mobile.webp",        // 480x300px
      tabletSmall: "/images/hero/newhero01tablet1200_500.webp", // 768x400px
      tabletLarge: "/images/hero/newhero01tablet1200_500.webp", // 1024x500px
      desktopSmall: "/images/hero/newhero01dekstop.webp",      // 1200x600px
      desktopLarge: "/images/hero/newhero01dekstop.webp"       // 1920x800px
    }
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
      <div className="container-herlan">
        {/* Main Banner Carousel */}
        <div 
          className="relative min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] 2xl:min-h-[450px] overflow-hidden rounded-xl cursor-grab active:cursor-grabbing select-none"
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
              <div className="w-full h-full relative rounded-xl overflow-hidden">
                {/* Desktop Large Image - 1440px+ */}
                <div className="hidden 2xl:block absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.desktopLarge}
                      alt={slide.title}
                      width={1920}
                      height={800}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(min-width: 1440px) 1920px"
                      quality={85}
                    />
                  </div>
                </div>
                
                {/* Desktop Small Image - 1200px-1439px */}
                <div className="hidden xl:block 2xl:hidden absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.desktopSmall}
                      alt={slide.title}
                      width={1200}
                      height={600}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(min-width: 1200px) and (max-width: 1439px) 1200px"
                      quality={85}
                    />
                  </div>
                </div>
                
                {/* Tablet Large Image - 1024px-1199px */}
                <div className="hidden lg:block xl:hidden absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.tabletLarge}
                      alt={slide.title}
                      width={1024}
                      height={500}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(min-width: 1024px) and (max-width: 1199px) 1024px"
                      quality={85}
                    />
                  </div>
                </div>
                
                {/* Tablet Small Image - 768px-1023px */}
                <div className="hidden md:block lg:hidden absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.tabletSmall}
                      alt={slide.title}
                      width={768}
                      height={400}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(min-width: 768px) and (max-width: 1023px) 768px"
                      quality={85}
                    />
                  </div>
                </div>
                
                {/* Mobile Large Image - 480px-767px */}
                <div className="hidden sm:block md:hidden absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.mobileLarge}
                      alt={slide.title}
                      width={480}
                      height={300}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(min-width: 480px) and (max-width: 767px) 480px"
                      quality={85}
                    />
                  </div>
                </div>
                
                {/* Mobile Small Image - 320px-479px */}
                <div className="sm:hidden absolute inset-0 rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={slide.backgroundImage.mobileSmall}
                      alt={slide.title}
                      width={320}
                      height={200}
                      priority={index === 0}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      sizes="(max-width: 479px) 320px"
                      quality={85}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}



        </div>
      </div>


    </section>
  );
}


