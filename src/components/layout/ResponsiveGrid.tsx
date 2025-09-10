"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'section' | 'main' | 'article';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-6',
  lg: 'gap-4 sm:gap-6 lg:gap-8',
  xl: 'gap-6 sm:gap-8 lg:gap-10',
};

const getGridCols = (cols: ResponsiveGridProps['cols']) => {
  const {
    default: defaultCols = 1,
    sm = defaultCols,
    md = sm,
    lg = md,
    xl = lg,
    '2xl': xl2 = xl,
  } = cols || {};

  return cn(
    'grid',
    `grid-cols-${defaultCols}`,
    `sm:grid-cols-${sm}`,
    `md:grid-cols-${md}`,
    `lg:grid-cols-${lg}`,
    `xl:grid-cols-${xl}`,
    `2xl:grid-cols-${xl2}`
  );
};

export default function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  as: Component = 'div',
}: ResponsiveGridProps) {
  return (
    <Component
      className={cn(
        getGridCols(cols),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Predefined grid layouts for common use cases
export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
      gap="md"
      className={cn('auto-rows-fr', className)}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function CategoryGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      cols={{ default: 2, sm: 3, md: 4, lg: 6, xl: 8 }}
      gap="sm"
      className={cn('auto-rows-fr', className)}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function CardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
      gap="lg"
      className={cn('auto-rows-fr', className)}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function AdminGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      cols={{ default: 1, md: 2, lg: 3, xl: 4 }}
      gap="md"
      className={cn('auto-rows-fr', className)}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Masonry-style grid for varied content heights
export function MasonryGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5',
        'gap-4 sm:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}
