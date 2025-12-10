'use client';

import { usePathname } from 'next/navigation';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import dynamic from 'next/dynamic';
import MobileBottomNav from '../navigation/MobileBottomNav';
import React from 'react';

const StickyCartButton = dynamic(() => import('../cart/StickyCartButton'), {
  ssr: false,
});

const ChatWidget = dynamic(() => import('../chat/ChatWidget'), {
  ssr: false,
});

const UnifiedFloatingChatWidget = dynamic(() => import('../chat/UnifiedFloatingChatWidget'), {
  ssr: false,
});

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [renderDeferredUi, setRenderDeferredUi] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => setRenderDeferredUi(true), { timeout: 2000 });
    } else {
      window.setTimeout(() => setRenderDeferredUi(true), 50);
    }
  }, []);
  
  // Check if current path is admin pages
  const isAdminPage = pathname.startsWith('/admin');
  
  // For admin pages, don't show main website header/footer
  if (isAdminPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }
  
  // For all other pages, show the full layout with header and footer
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0 bg-gradient-to-br from-rose-50 to-rose-100">
        {children}
      </main>
      <Footer />
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      {renderDeferredUi && (
        <>
          {/* Sticky Cart Button */}
          <StickyCartButton />
          {/* Chat Widget */}
          <ChatWidget />
          {/* Unified Floating Chat Widget */}
          <UnifiedFloatingChatWidget />
        </>
      )}
    </div>
  );
}
