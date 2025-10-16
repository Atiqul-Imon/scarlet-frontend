"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/context';

export default function WishlistRedirect() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect authenticated users to their wishlist
        router.replace('/account/wishlist');
      } else {
        // Redirect unauthenticated users to login
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to wishlist...</p>
      </div>
    </div>
  );
}
