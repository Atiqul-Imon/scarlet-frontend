"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface MetaPixelProps {
  pixelId?: string;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  // Use provided pixelId or environment variable
  const pixelIdValue = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MetaPixel] Pixel ID Value:', pixelIdValue);
      console.log('[MetaPixel] Environment Variable:', process.env.NEXT_PUBLIC_META_PIXEL_ID);
    }
  }, [pixelIdValue]);

  useEffect(() => {
    // Track page view on route change (client-side navigation)
    if (typeof window !== 'undefined' && window.fbq && pixelIdValue) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, pixelIdValue]);

  if (!pixelIdValue) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[MetaPixel] No Pixel ID found. Component will not render.');
    }
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[MetaPixel] Script loaded successfully');
          // Verify fbq is available after script loads
          setTimeout(() => {
            if (typeof window.fbq === 'function') {
              console.log('[MetaPixel] fbq function is available');
            } else {
              console.warn('[MetaPixel] fbq function not available after script load');
            }
          }, 1000);
        }}
        onError={(e) => {
          console.error('[MetaPixel] Script failed to load:', e);
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelIdValue}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelIdValue}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
