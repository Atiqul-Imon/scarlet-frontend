"use client";
import * as React from 'react';
import Link from 'next/link';

export interface MegaItem {
  label: string;
  href?: string;
  icon?: string | undefined;
  id?: string;
  columns?: Array<{ title?: string; items: Array<{ label: string; href: string }> }>;
}

export function MegaMenu({ items }: { items: MegaItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const openTimer = React.useRef<NodeJS.Timeout | null>(null);
  const closeTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Top-level nav slider
  const navRef = React.useRef<HTMLDivElement>(null);
  const scrollNavBy = (delta: number) => navRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className="relative hidden lg:block w-full">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10" />

      {/* chevrons */}
      <button
        aria-label="Scroll menu left"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-700 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:shadow h-8 w-8 grid place-items-center transition-colors"
        onClick={() => scrollNavBy(-300)}
      >
        <Chevron dir="left" />
      </button>
      <button
        aria-label="Scroll menu right"
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-700 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:shadow h-8 w-8 grid place-items-center transition-colors"
        onClick={() => scrollNavBy(300)}
      >
        <Chevron dir="right" />
      </button>

      <div ref={navRef} className="overflow-x-auto no-scrollbar w-full">
        <nav className="min-w-max inline-flex items-center gap-0" role="navigation" aria-label="Primary">
          {items.map((m, idx) => (
            <div
              key={m.id || `${m.label}-${idx}`}
              className="relative"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
                openTimer.current = setTimeout(() => {
                  setOpenIndex(idx);
                  setIsHovering(true);
                }, 120);
              }}
              onMouseLeave={() => {
                if (openTimer.current) clearTimeout(openTimer.current);
                closeTimer.current = setTimeout(() => {
                  setIsHovering(false);
                  setOpenIndex(null);
                }, 180);
              }}
            >
              <Link 
                href={m.href ?? '#'} 
                className={`text-sm font-medium hover:text-red-700 hover:bg-red-50 whitespace-nowrap inline-flex items-center px-4 py-3 transition-colors border-r border-gray-100 last:border-r-0 ${
                  openIndex === idx ? 'text-red-700 bg-red-50' : 'text-gray-700'
                }`}
              >
                {m.label}
                {m.columns && (
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {m.columns && openIndex === idx && (
                <MenuPanel columns={m.columns} onClose={() => setOpenIndex(null)} />
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Chevron({ dir = 'left' }: { dir?: 'left' | 'right' }) {
  const isLeft = dir === 'left';
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      {isLeft ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

function MenuPanel({
  columns,
  onClose,
}: {
  columns: Array<{ title?: string; items: Array<{ label: string; href: string }> }>;
  onClose: () => void;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  
  return (
    <>
      {/* Backdrop to capture clicks */}
      <div className="fixed inset-0 z-40" onMouseEnter={onClose} />
      <div className="absolute left-0 top-full mt-0 w-full max-w-[100vw] bg-white shadow-xl border border-gray-200 z-50 rounded-b-lg">
        <div className="px-8 py-6 relative">
          {/* edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />

          {/* chevrons */}
          <button
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-700 rounded-full border border-gray-200 bg-white/90 hover:bg-white shadow-sm hover:shadow h-10 w-10 grid place-items-center transition-colors"
            onClick={() => scrollBy(-360)}
          >
            <Chevron dir="left" />
          </button>
          <button
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-gray-600 hover:text-red-700 rounded-full border border-gray-200 bg-white/90 hover:bg-white shadow-sm hover:shadow h-10 w-10 grid place-items-center transition-colors"
            onClick={() => scrollBy(360)}
          >
            <Chevron dir="right" />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-12"
            role="region"
            aria-label="Mega menu slider"
          >
            {columns.map((col, cidx) => (
              <div key={cidx} className="min-w-[220px] snap-start shrink-0">
                {col.title && (
                  <div className="mb-3 text-sm font-semibold text-red-700 uppercase tracking-wide border-b border-red-100 pb-2">
                    {col.title}
                  </div>
                )}
                <ul className="space-y-2">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <Link 
                        href={it.href} 
                        className="text-sm text-gray-700 hover:text-red-700 hover:underline transition-colors block py-1"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
