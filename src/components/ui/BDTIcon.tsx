import React from 'react';

interface BDTIconProps {
  className?: string;
}

export function BDTIcon({ className = "w-6 h-6" }: BDTIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* BDT Symbol - ৳ */}
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ৳
      </text>
    </svg>
  );
}

export default BDTIcon;
