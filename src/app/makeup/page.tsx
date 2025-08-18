"use client";
import { redirect } from 'next/navigation';

export default function MakeupProductsPage() {
  redirect('/products?category=makeup');
}
