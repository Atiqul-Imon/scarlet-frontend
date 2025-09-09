"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    default?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    sm?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    md?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    lg?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    xl?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  margin?: {
    default?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    sm?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    md?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    lg?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    xl?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';
}

const spacingClasses = {
  none: 'p-0',
  sm: 'p-2 sm:p-3',
  md: 'p-4 sm:p-6 lg:p-8',
  lg: 'p-6 sm:p-8 lg:p-12',
  xl: 'p-8 sm:p-12 lg:p-16',
  '2xl': 'p-12 sm:p-16 lg:p-20',
};

const marginClasses = {
  none: 'm-0',
  sm: 'm-2 sm:m-3',
  md: 'm-4 sm:m-6 lg:m-8',
  lg: 'm-6 sm:m-8 lg:m-12',
  xl: 'm-8 sm:m-12 lg:m-16',
  '2xl': 'm-12 sm:m-16 lg:m-20',
};

const getResponsiveSpacing = (
  spacing: ResponsiveSpacingProps['padding'] | ResponsiveSpacingProps['margin'],
  type: 'padding' | 'margin'
) => {
  const {
    default: defaultSpacing = 'md',
    sm = defaultSpacing,
    md = sm,
    lg = md,
    xl = lg,
  } = spacing || {};

  const classes = type === 'padding' ? spacingClasses : marginClasses;

  return cn(
    classes[defaultSpacing],
    `sm:${classes[sm].replace('p-', 'p-').replace('m-', 'm-')}`,
    `md:${classes[md].replace('p-', 'p-').replace('m-', 'm-')}`,
    `lg:${classes[lg].replace('p-', 'p-').replace('m-', 'm-')}`,
    `xl:${classes[xl].replace('p-', 'p-').replace('m-', 'm-')}`
  );
};

export default function ResponsiveSpacing({
  children,
  className,
  padding = { default: 'md' },
  margin = { default: 'none' },
  as: Component = 'div',
}: ResponsiveSpacingProps) {
  return (
    <Component
      className={cn(
        getResponsiveSpacing(padding, 'padding'),
        getResponsiveSpacing(margin, 'margin'),
        className
      )}
    >
      {children}
    </Component>
  );
}

// Predefined spacing components for common use cases
export function PageSpacing({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveSpacing
      padding={{ default: 'md', sm: 'lg', lg: 'xl' }}
      className={cn('min-h-screen', className)}
    >
      {children}
    </ResponsiveSpacing>
  );
}

export function SectionSpacing({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveSpacing
      padding={{ default: 'lg', sm: 'xl', lg: '2xl' }}
      className={cn('w-full', className)}
    >
      {children}
    </ResponsiveSpacing>
  );
}

export function CardSpacing({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveSpacing
      padding={{ default: 'md', sm: 'lg' }}
      className={cn('w-full', className)}
    >
      {children}
    </ResponsiveSpacing>
  );
}

export function ContainerSpacing({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveSpacing
      padding={{ default: 'sm', sm: 'md', lg: 'lg' }}
      className={cn('w-full', className)}
    >
      {children}
    </ResponsiveSpacing>
  );
}
