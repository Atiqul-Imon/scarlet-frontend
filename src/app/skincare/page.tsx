"use client";
import { redirect } from 'next/navigation';

export default function SkincareProductsPage() {
  // Redirect to products page with category filter
  redirect('/products?category=skincare');
}
