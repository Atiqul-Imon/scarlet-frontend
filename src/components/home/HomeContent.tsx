"use client";
import * as React from 'react';
import dynamic from 'next/dynamic';
import Hero from "../hero/Hero";
import LazyProductShowcase from "../products/LazyProductShowcase";

// Lazy-load BrandShowcase (below the fold)
const BrandShowcase = dynamic(() => import("../brands/BrandShowcase"), {
  ssr: false,
  loading: () => (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="container-herlan">
        {/* Section Header Skeleton */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="h-10 sm:h-12 md:h-14 w-64 sm:w-80 md:w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        </div>
        
        {/* Category Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              {/* Image Container - Aspect Square */}
              <div className="w-full aspect-square bg-gray-200 rounded-xl mb-0"></div>
              {/* Category Name */}
              <div className="p-4 sm:p-5 text-center">
                <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function HomeContent() {
  return (
    <div className="bg-gradient-to-br from-rose-50 to-rose-100">
      <Hero />
      
      {/* Category Section (previously Brand Showcase) */}
      <BrandShowcase />
      
      {/* New Arrivals */}
      <LazyProductShowcase 
        title="New Arrivals"
        subtitle="Discover our latest beauty essentials"
        category="new"
        viewAllLink="/products?filter=new"
        limit={30}
      />
      
      {/* Coming Soon */}
      <LazyProductShowcase 
        title="Coming Soon"
        subtitle="Get ready for exciting new products"
        category="coming-soon"
        viewAllLink="/products?filter=coming-soon"
        limit={30}
      />
      
      {/* Skincare Section */}
      <LazyProductShowcase 
        title="Skincare Essentials"
        subtitle="Nourish and protect your skin"
        category="skincare-essentials"
        viewAllLink="/products?filter=skincare-essentials"
        limit={30}
      />
      
      {/* Makeup Section */}
      <LazyProductShowcase 
        title="Makeup Collection"
        subtitle="Enhance your natural beauty"
        category="makeup-collection"
        viewAllLink="/products?filter=makeup-collection"
        limit={30}
      />
    </div>
  );
}

