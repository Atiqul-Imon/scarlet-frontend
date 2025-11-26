'use client';

import { useEffect } from 'react';
import { adminApi } from '@/lib/api';

/**
 * BackgroundColorProvider
 * 
 * Fetches the website background color from system settings and applies it
 * to the document body. This runs on the client side to avoid blocking
 * server-side rendering.
 */
export default function BackgroundColorProvider({ children }: { children: React.ReactNode }) {
  const applyColor = (color: string, retryCount = 0) => {
    const bgColor = color || '#FFFFFF';
    const maxRetries = 5;
    
    // Apply to CSS custom property (used by globals.css)
    document.documentElement.style.setProperty('--background', bgColor);
    
    // Apply directly to body and html elements
    document.body.style.backgroundColor = bgColor;
    document.documentElement.style.backgroundColor = bgColor;

    // Add class to body for CSS targeting
    document.body.classList.add('custom-background-applied');

    // Inject a global style to apply background to all page-level containers
    let styleElement = document.getElementById('dynamic-background-style');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-background-style';
      document.head.appendChild(styleElement);
    }
    
    // Comprehensive CSS to apply background to entire website
    // This targets all possible page structures
    styleElement.textContent = `
      /* Apply website background globally */
      html,
      body,
      body > div:first-child,
      body > div:first-child > div:first-child,
      body > div:first-child > div:first-child > div,
      body main,
      body [role="main"],
      body .flex.flex-col.min-h-screen,
      body .flex.flex-col.min-h-screen > div,
      body .flex.flex-col.min-h-screen main,
      body [style*="background-color: var(--background"] {
        background-color: ${bgColor} !important;
      }
      
      /* Override all bg-white, bg-gray, and other background classes on page containers */
      body > div:first-child.bg-white,
      body > div:first-child > div:first-child.bg-white,
      body > div:first-child > div:first-child > div.bg-white,
      body main.bg-white,
      body [role="main"].bg-white,
      body .flex.flex-col.min-h-screen.bg-white,
      body .flex.flex-col.min-h-screen > div.bg-white {
        background-color: ${bgColor} !important;
      }
      
      /* Target homepage and other page containers */
      body > div:first-child > div:first-child > div[style*="var(--background"],
      body > div:first-child > div:first-child > div[style*="backgroundColor"] {
        background-color: ${bgColor} !important;
      }
    `;

    // Directly apply to elements that might have inline styles
    const applyToElements = () => {
      // Apply to all divs that are direct children of main or root containers
      const rootDivs = document.querySelectorAll('body > div:first-child > div:first-child > div');
      rootDivs.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Check if it's a page-level container (not a component)
        if (htmlEl.children.length > 0 || htmlEl.textContent) {
          htmlEl.style.backgroundColor = bgColor;
        }
      });

      // Apply to main elements
      const mainElements = document.querySelectorAll('main, [role="main"]');
      mainElements.forEach((el) => {
        (el as HTMLElement).style.backgroundColor = bgColor;
      });
    };

    // Apply immediately
    applyToElements();

    // Retry after a short delay to handle Next.js hydration
    if (retryCount < maxRetries) {
      setTimeout(() => {
        applyToElements();
        if (retryCount < maxRetries - 1) {
          applyColor(color, retryCount + 1);
        }
      }, 100 * (retryCount + 1));
    }

    // Also update the Tailwind color variable if needed
    const hsl = hexToHsl(bgColor);
    if (hsl) {
      document.documentElement.style.setProperty('--color-background', hsl);
    }
  };

  useEffect(() => {
    const fetchAndApplyColor = async () => {
      try {
        // Fetch public appearance settings (no auth required)
        const settings = await adminApi.appearance.getPublicSettings();
        // Apply with retry to handle Next.js hydration
        applyColor(settings.websiteBackgroundColor);
      } catch (error) {
        console.error('Failed to load background color settings:', error);
        // Fallback to default white
        applyColor('#FFFFFF');
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchAndApplyColor);
    } else {
      // DOM is already ready, but wait a bit for Next.js hydration
      setTimeout(fetchAndApplyColor, 100);
    }

    // Also try after a longer delay to catch any late-rendering elements
    const delayedApply = setTimeout(() => {
      fetchAndApplyColor();
    }, 500);

    // Listen for color changes from admin panel
    const handleColorChange = (event: CustomEvent) => {
      applyColor(event.detail.color);
    };

    window.addEventListener('background-color-changed', handleColorChange as EventListener);

    // Use MutationObserver to watch for DOM changes and reapply
    const observer = new MutationObserver(() => {
      // Reapply color when DOM changes (handles dynamic content)
      const styleElement = document.getElementById('dynamic-background-style');
      if (styleElement?.textContent) {
        const match = styleElement.textContent.match(/background-color:\s*([^;!]+)/);
        if (match && match[1]) {
          const currentColor = match[1].trim();
          if (currentColor && currentColor !== '#FFFFFF') {
            applyColor(currentColor, 0);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(delayedApply);
      window.removeEventListener('background-color-changed', handleColorChange as EventListener);
      observer.disconnect();
    };
  }, []);

  // Render children immediately - color will be applied asynchronously
  return <>{children}</>;
}

/**
 * Convert hex color to HSL format for Tailwind CSS variables
 * Returns format: "h s% l%" (e.g., "0 0% 100%")
 */
function hexToHsl(hex: string): string | null {
  try {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (error) {
    console.error('Failed to convert hex to HSL:', error);
    return null;
  }
}

