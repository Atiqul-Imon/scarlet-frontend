"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../lib/context';

interface ShareButtonProps {
  product: {
    title: string;
    slug: string;
    description?: string;
    images?: string[];
    price?: {
      amount: number;
      currency: string;
    };
  };
  className?: string;
}

export default function ShareButton({ product, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://scarletunlimited.net/products/${product.slug}`;
  
  const shareText = `${product.title} - ${product.price ? `${product.price.currency} ${product.price.amount}` : 'Check it out'} at Scarlet`;
  const shareImage = product.images?.[0] || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Native Web Share API (mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: shareText,
          url: currentUrl,
        });
        setIsOpen(false);
        addToast({
          type: 'success',
          title: 'Shared!',
          message: 'Product shared successfully',
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  // Facebook Share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Opening Facebook...',
      message: 'Share this product on Facebook',
    });
  };

  // Twitter/X Share
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${product.title} - ${currentUrl}`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Opening Twitter...',
      message: 'Share this product on Twitter/X',
    });
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText}\n${currentUrl}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Opening WhatsApp...',
      message: 'Share this product on WhatsApp',
    });
  };

  // LinkedIn Share
  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Opening LinkedIn...',
      message: 'Share this product on LinkedIn',
    });
  };

  // Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setIsOpen(false);
      addToast({
        type: 'success',
        title: 'Link Copied!',
        message: 'Product link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      addToast({
        type: 'error',
        title: 'Failed to Copy',
        message: 'Please try again',
      });
    }
  };

  // Email Share
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out ${product.title} at Scarlet`);
    const body = encodeURIComponent(`${shareText}\n\n${currentUrl}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Opening Email...',
      message: 'Share this product via email',
    });
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      action: handleFacebookShare,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    {
      name: 'Twitter/X',
      icon: TwitterIcon,
      action: handleTwitterShare,
      color: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900',
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      action: handleWhatsAppShare,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      action: handleLinkedInShare,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    },
    {
      name: 'Email',
      icon: EmailIcon,
      action: handleEmailShare,
      color: 'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600',
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? CheckIcon : CopyIcon,
      action: handleCopyLink,
      color: copied 
        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
        : 'bg-gradient-to-r from-rose-300 to-pink-400 hover:from-rose-400 hover:to-pink-500',
    },
  ];

  // Show native share on mobile if available
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {hasNativeShare && isMobile ? (
        // Native share button for mobile - compact and elegant
        <button
          onClick={handleNativeShare}
          className="group flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-rose-200 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
        >
          <div className="relative">
            <ShareIcon className="text-rose-600 w-4 h-4" />
            <div className="absolute inset-0 bg-rose-400 opacity-0 group-active:opacity-20 rounded-full blur-sm transition-opacity duration-200"></div>
          </div>
          <span className="text-xs font-semibold text-rose-700 hidden sm:inline">Share</span>
        </button>
      ) : (
        // Dropdown share button - elegant design for both mobile and desktop
        <>
          {/* Mobile: Compact button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 border-2 rounded-full transition-all duration-300 bg-white shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 ${
              isOpen 
                ? 'border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 shadow-md' 
                : 'border-rose-200 hover:border-rose-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50'
            }`}
          >
            <div className="relative">
              <ShareIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                isOpen ? 'text-rose-600' : 'text-rose-500 group-hover:text-rose-600'
              }`} />
              {isOpen && (
                <div className="absolute inset-0 bg-rose-400 opacity-20 rounded-full blur-md animate-pulse"></div>
              )}
            </div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:inline ${
              isOpen ? 'text-rose-700' : 'text-rose-600 group-hover:text-rose-700'
            }`}>
              Share
            </span>
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${isOpen ? 'rotate-180 text-rose-600' : 'text-rose-400 group-hover:text-rose-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu - Responsive positioning and sizing */}
          {isOpen && (
            <div className={`absolute ${
              isMobile ? 'bottom-full left-0 mb-2 w-56' : 'bottom-full left-0 mb-3 w-64'
            } bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-sm bg-white/98`}>
              {/* Header - Elegant gradient */}
              <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                    <ShareIcon className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-rose-900">Share Product</h3>
                    <p className="text-[10px] sm:text-xs text-rose-600">Choose a platform</p>
                  </div>
                </div>
              </div>

              {/* Share Options - Icon-only on mobile, full buttons on desktop */}
              <div className={`p-2 sm:p-3 ${
                isMobile 
                  ? 'grid grid-cols-3 gap-2' 
                  : 'space-y-1.5 sm:space-y-2'
              }`}>
                {shareOptions.map((option, index) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`group/option ${
                      isMobile 
                        ? 'aspect-square flex items-center justify-center rounded-xl' 
                        : 'w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl'
                    } transition-all duration-200 text-white ${option.color} hover:scale-[1.02] transform hover:shadow-lg active:scale-95 relative overflow-hidden`}
                    style={{ animationDelay: `${index * 30}ms` }}
                    title={isMobile ? option.name : undefined}
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/option:translate-x-full transition-transform duration-700"></div>
                    
                    {/* Icon */}
                    <div className={`relative z-10 ${isMobile ? 'flex-shrink-0' : 'flex-shrink-0'}`}>
                      <option.icon />
                    </div>
                    
                    {/* Text - Hidden on mobile, shown on desktop */}
                    {!isMobile && (
                      <span className="relative z-10 text-xs sm:text-sm font-semibold flex-1 text-left">{option.name}</span>
                    )}
                    
                    {/* Arrow indicator - hidden on mobile */}
                    {!isMobile && (
                      <svg 
                        className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover/option:opacity-100 transition-opacity duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Icons
function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-colors duration-300 ${className}`}
    >
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

