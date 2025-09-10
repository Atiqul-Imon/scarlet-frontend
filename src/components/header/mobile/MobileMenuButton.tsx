"use client";
import React from 'react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export default function MobileMenuButton({ isOpen, onClick, className = '' }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-gray-700 hover:text-pink-600 transition-colors ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
          }`}
        />
      </div>
    </button>
  );
}
