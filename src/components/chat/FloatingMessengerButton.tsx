'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface FloatingMessengerButtonProps {
  className?: string;
}

export default function FloatingMessengerButton({ className = '' }: FloatingMessengerButtonProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  // Hide on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMessengerClick = () => {
    const facebookPageId = 'yourpageid'; // Update with your Facebook Page ID
    const messengerUrl = `https://m.me/${facebookPageId}`;
    window.open(messengerUrl, '_blank');
  };

  // Hide on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <div className={`fixed ${isMobile ? 'right-4 bottom-44' : 'right-4 bottom-44'} z-50 ${className}`}>
      <button
        onClick={handleMessengerClick}
        className="group relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110"
        aria-label="Chat on Messenger"
      >
        {/* Messenger Icon */}
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 3.54 1.84 6.65 4.61 8.44v3.56l3.42-1.88C10.68 21.88 11.32 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.13 13.83l-2.61-2.79-5.09 2.79L10.52 10l2.61 2.79L18.22 10l-5.09 5.83z"/>
        </svg>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          Chat on Messenger
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></span>
      </button>
    </div>
  );
}
