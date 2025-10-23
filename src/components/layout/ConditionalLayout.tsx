'use client';

import { usePathname } from 'next/navigation';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import StickyCartButton from '../cart/StickyCartButton';
import FloatingWhatsAppButton from '../chat/FloatingWhatsAppButton';
import FloatingMessengerButton from '../chat/FloatingMessengerButton';
import ChatWidget from '../chat/ChatWidget';
import MobileBottomNav from '../navigation/MobileBottomNav';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is admin or account pages
  const isAdminPage = pathname.startsWith('/admin');
  const isAccountPage = pathname.startsWith('/account');
  
  // For admin and account pages, don't show main website header/footer
  if (isAdminPage || isAccountPage) {
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      {/* Sticky Cart Button */}
      <StickyCartButton />
      {/* Chat Widget */}
      <ChatWidget />
      {/* Separated Chat Widgets */}
      <FloatingWhatsAppButton />
      <FloatingMessengerButton />
    </div>
  );
}
