"use client";
import * as React from 'react';
import EnhancedProductCard from './EnhancedProductCard';
import type { Product } from '../../lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  showQuickActions?: boolean;
}

export default function ProductCard(props: ProductCardProps) {
  // Use the enhanced product card for all product displays
  return <EnhancedProductCard {...props} />;
}