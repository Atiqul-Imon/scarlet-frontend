'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

/**
 * BackgroundColorProvider
 * 
 * Fetches the website background color from system settings and applies it
 * to the document body. This runs on the client side to avoid blocking
 * server-side rendering.
 */
export default function BackgroundColorProvider({ children }: { children: React.ReactNode }) {
  const applyColor = (color: string) => {
    const bgColor = color || '#FFFFFF';
    
    // Apply to CSS custom property
    document.documentElement.style.setProperty('--background', bgColor);
    
    // Apply directly to body element
    document.body.style.backgroundColor = bgColor;

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
        applyColor(settings.websiteBackgroundColor);
      } catch (error) {
        console.error('Failed to load background color settings:', error);
        // Fallback to default white
        applyColor('#FFFFFF');
      }
    };

    fetchAndApplyColor();

    // Listen for color changes from admin panel
    const handleColorChange = (event: CustomEvent) => {
      applyColor(event.detail.color);
    };

    window.addEventListener('background-color-changed', handleColorChange as EventListener);

    return () => {
      window.removeEventListener('background-color-changed', handleColorChange as EventListener);
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

