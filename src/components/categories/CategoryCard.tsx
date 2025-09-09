"use client";
import Link from 'next/link';

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
  };
}

const categoryIcons: Record<string, string> = {
  'skincare': '🌿',
  'skin care': '🌿',
  'makeup': '💄',
  'make up': '💄',
  'hair care': '💇‍♀️',
  'body care': '🧴',
  'cleansers': '🧼',
  'moisturizers': '💧',
  'serums': '🧪',
  'sunscreen': '☀️',
  'foundation': '🎨',
  'lipstick': '💋',
  'eye makeup': '👁️',
  'shampoo': '🧴',
  'bath & body care': '🛁',
  'bath body': '🛁',
  'accessories': '✨',
  'fragrance': '🌸',
  'tools': '🔧'
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const icon = category.icon || categoryIcons[category.name.toLowerCase()] || '🌟';
  
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group block transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
    >
      <div className="text-center">
        {/* Category Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-colors duration-300 group-hover:shadow-lg">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-2xl">{icon}</span>
        </div>
        
        {/* Category Name */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-tight">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
