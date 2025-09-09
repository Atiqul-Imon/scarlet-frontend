"use client";
import { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import type { Category } from '../../lib/types';

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

export default function CategoryGrid({ categories, loading = false }: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-3"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {categories.map((category) => (
        <CategoryCard 
          key={category._id} 
          category={category} 
        />
      ))}
    </div>
  );
}
