"use client";
import { redirect } from 'next/navigation';

export default function BathBodyProductsPage() {
  redirect('/products?category=bath-body');
}
