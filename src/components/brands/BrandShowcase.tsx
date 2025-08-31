"use client";
import * as React from 'react';
import Link from 'next/link';

interface Brand {
  name: string;
  href: string;
  logo?: string;
  description: string;
  featured?: boolean;
}

const brands: Brand[] = [
  {
    name: "SCARLET",
    href: "/brands/scarlet",
    description: "Premium beauty essentials",
    featured: true
  },
  {
    name: "K-Beauty",
    href: "/brands/k-beauty", 
    description: "Korean skincare innovation"
  },
  {
    name: "GLOW",
    href: "/brands/glow",
    description: "Natural radiance"
  },
  {
    name: "PURE",
    href: "/brands/pure",
    description: "Clean beauty solutions"
  },
  {
    name: "LUXE",
    href: "/brands/luxe",
    description: "Premium cosmetics"
  },
  {
    name: "BLOOM",
    href: "/brands/bloom",
    description: "Botanical skincare"
  },
  {
    name: "ESSENCE",
    href: "/brands/essence",
    description: "Beauty fundamentals"
  },
  {
    name: "RADIANT",
    href: "/brands/radiant",
    description: "Illuminating products"
  }
];

export default function BrandShowcase() {
  return (
    <section className="py-16 bg-white">
      <div className="container-herlan">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Brand
          </h2>
          <p className="text-gray-600">
            Discover your favorite beauty brands
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group"
            >
              <div className={`
                bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center 
                hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                ${brand.featured ? 'ring-2 ring-pink-200 bg-gradient-to-br from-pink-50 to-rose-50' : ''}
              `}>
                <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-gray-700">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-pink-600 transition-colors duration-300">
                  {brand.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {brand.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
          >
            View All Brands
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
