"use client";
import * as React from 'react';
import Image from 'next/image';

interface BannerSlide {
  id: number;
  title: string;
  backgroundImage: {
    desktop: string;
    mobile: string;
  };
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Beauty Collection",
    backgroundImage: {
      desktop: "/images/hero/hero-1-1920x800.webp",
      mobile: "/images/hero/hero-1-mobile-768x400.webp"
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
          className="relative h-[30vh] md:h-[35vh] overflow-hidden rounded-xl cursor-grab active:cursor-grabbing select-none"
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
                {/* Responsive Background Image */}
                <Image
                  src={slide.backgroundImage.desktop}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 768px, 1920px"
                  quality={85}
                />
                
                {/* Mobile Image Overlay */}
                <div className="md:hidden absolute inset-0">
                  <Image
                    src={slide.backgroundImage.mobile}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="768px"
                    quality={85}
                  />
                </div>
              </div>
            </div>
          ))}



        </div>
      </div>


    </section>
  );
}


