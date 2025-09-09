"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';
}

const sizeClasses = {
  sm: 'max-w-2xl',      // 672px
  md: 'max-w-4xl',      // 896px
  lg: 'max-w-6xl',      // 1152px
  xl: 'max-w-7xl',      // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',   // 100%
};

const paddingClasses = {
  none: 'px-0',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  xl: 'px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16',
};

export default function ResponsiveContainer({
  children,
  className,
  size = 'xl',
  padding = 'md',
  as: Component = 'div',
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Specialized container variants for common use cases
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer
      size="xl"
      padding="lg"
      className={cn('py-8', className)}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function SectionContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer
      size="xl"
      padding="md"
      className={cn('py-12 sm:py-16 lg:py-20', className)}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ContentContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer
      size="lg"
      padding="md"
      className={cn('py-6', className)}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function NarrowContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer
      size="md"
      padding="md"
      className={cn('py-8', className)}
    >
      {children}
    </ResponsiveContainer>
  );
}
