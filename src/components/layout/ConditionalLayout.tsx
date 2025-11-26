'use client';

import { usePathname } from 'next/navigation';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import StickyCartButton from '../cart/StickyCartButton';
import UnifiedFloatingChatWidget from '../chat/UnifiedFloatingChatWidget';
import ChatWidget from '../chat/ChatWidget';
import MobileBottomNav from '../navigation/MobileBottomNav';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background, #ffffff)' }}>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0" style={{ backgroundColor: 'var(--background, #ffffff)' }}>
        {children}
      </main>
      <Footer />
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      {/* Sticky Cart Button */}
      <StickyCartButton />
      {/* Chat Widget */}
      <ChatWidget />
      {/* Unified Floating Chat Widget */}
      <UnifiedFloatingChatWidget />
    </div>
  );
}
