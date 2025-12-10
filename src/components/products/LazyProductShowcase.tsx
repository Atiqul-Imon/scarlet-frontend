"use client";
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/Skeleton';
import { SectionContainer } from '../layout';

// Lazy-load ProductShowcase component
const ProductShowcase = dynamic(() => import('./ProductShowcase'), {
  ssr: false,
});

interface LazyProductShowcaseProps {
  title: string;
  subtitle?: string;
  category?: string;
  viewAllLink: string;
  limit?: number;
}

// Loading skeleton component
const ProductShowcaseSkeleton = () => (
  <section className="bg-gradient-to-br from-rose-50 to-rose-100 py-12 lg:py-16">
    <SectionContainer>
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </SectionContainer>
  </section>
);

export default function LazyProductShowcase(props: LazyProductShowcaseProps) {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (shouldLoad || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        // Start loading when component is 200px away from viewport
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <ProductShowcase {...props} />
      ) : (
        <ProductShowcaseSkeleton />
      )}
    </div>
  );
}

