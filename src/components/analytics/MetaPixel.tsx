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
  const pixelIdValue = pixelId || process.env['NEXT_PUBLIC_META_PIXEL_ID'];

  // Debug logging (always enabled for troubleshooting)
  useEffect(() => {
    console.log('[MetaPixel] Component mounted');
    console.log('[MetaPixel] Pixel ID Value:', pixelIdValue);
    console.log('[MetaPixel] Environment Variable:', process.env['NEXT_PUBLIC_META_PIXEL_ID']);
  }, [pixelIdValue]);

  useEffect(() => {
    // Track page view on route change (client-side navigation)
    if (typeof window !== 'undefined' && window.fbq && pixelIdValue) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, pixelIdValue]);

  if (!pixelIdValue) {
    console.warn('[MetaPixel] No Pixel ID found. Component will not render.');
    console.warn('[MetaPixel] Check if NEXT_PUBLIC_META_PIXEL_ID is set in Vercel environment variables.');
    return null;
  }

  console.log('[MetaPixel] Rendering component with Pixel ID:', pixelIdValue);

  // Check if script tag exists after mount
  useEffect(() => {
    const checkScript = () => {
      const scriptTag = document.querySelector('script[id="meta-pixel"]');
      if (scriptTag) {
        console.log('[MetaPixel] ✅ Script tag found in DOM');
      } else {
        console.warn('[MetaPixel] ❌ Script tag not found in DOM');
      }
      
      // Check for Facebook script
      const fbScript = Array.from(document.scripts).find(s => 
        s.src.includes('connect.facebook.net')
      );
      if (fbScript) {
        console.log('[MetaPixel] ✅ Facebook script tag found:', fbScript.src);
      } else {
        console.warn('[MetaPixel] ⚠️ Facebook script not yet loaded (may load asynchronously)');
      }
      
      // Check for fbq after delay
      setTimeout(() => {
        if (typeof window.fbq === 'function') {
          console.log('[MetaPixel] ✅ fbq function is available');
          console.log('[MetaPixel] fbq object:', window.fbq);
        } else {
          console.warn('[MetaPixel] ❌ fbq function not available');
          console.warn('[MetaPixel] window.fbq type:', typeof window.fbq);
        }
      }, 2000);
    };
    
    // Check immediately and after a delay
    checkScript();
    setTimeout(checkScript, 1000);
  }, [pixelIdValue]);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[MetaPixel] ✅ Script tag onLoad callback fired');
        }}
        onError={(e) => {
          console.error('[MetaPixel] ❌ Script failed to load:', e);
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
