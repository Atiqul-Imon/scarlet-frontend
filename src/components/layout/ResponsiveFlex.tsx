"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    default?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
    xl?: 'row' | 'col';
  };
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer' | 'nav';
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const wrapClasses = {
  true: 'flex-wrap',
  sm: 'sm:flex-wrap',
  md: 'md:flex-wrap',
  lg: 'lg:flex-wrap',
  xl: 'xl:flex-wrap',
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-6',
  lg: 'gap-4 sm:gap-6 lg:gap-8',
  xl: 'gap-6 sm:gap-8 lg:gap-10',
};

const getDirectionClasses = (direction: ResponsiveFlexProps['direction']) => {
  const {
    default: defaultDir = 'row',
    sm = defaultDir,
    md = sm,
    lg = md,
    xl = lg,
  } = direction || {};

  return cn(
    'flex',
    directionClasses[defaultDir],
    `sm:${directionClasses[sm]}`,
    `md:${directionClasses[md]}`,
    `lg:${directionClasses[lg]}`,
    `xl:${directionClasses[xl]}`
  );
};

export default function ResponsiveFlex({
  children,
  className,
  direction = { default: 'row' },
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  as: Component = 'div',
}: ResponsiveFlexProps) {
  const wrapClass = typeof wrap === 'boolean' ? wrapClasses[wrap] : wrapClasses[wrap];

  return (
    <Component
      className={cn(
        getDirectionClasses(direction),
        alignClasses[align],
        justifyClasses[justify],
        wrapClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Predefined flex layouts for common use cases
export function HeaderFlex({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveFlex
      direction={{ default: 'col', sm: 'row' }}
      align="center"
      justify="between"
      gap="md"
      className={cn('py-4', className)}
    >
      {children}
    </ResponsiveFlex>
  );
}

export function ProductCardFlex({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveFlex
      direction="col"
      align="stretch"
      gap="sm"
      className={cn('h-full', className)}
    >
      {children}
    </ResponsiveFlex>
  );
}

export function ButtonGroupFlex({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveFlex
      direction={{ default: 'col', sm: 'row' }}
      align="center"
      gap="sm"
      wrap
      className={cn('w-full', className)}
    >
      {children}
    </ResponsiveFlex>
  );
}

export function SidebarFlex({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveFlex
      direction={{ default: 'col', lg: 'row' }}
      align="start"
      gap="lg"
      className={cn('min-h-screen', className)}
    >
      {children}
    </ResponsiveFlex>
  );
}

export function FormFlex({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveFlex
      direction="col"
      align="stretch"
      gap="md"
      className={cn('w-full', className)}
    >
      {children}
    </ResponsiveFlex>
  );
}
