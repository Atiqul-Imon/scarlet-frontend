"use client";
import React, { useState } from 'react';
import TopBar from './TopBar';
import { MegaMenu } from './MegaMenu';
import MobileHeader from './mobile/MobileHeader';
import MobileNavigation from './mobile/MobileNavigation';
import type { MegaItem } from './MegaMenu';

// Category data structure based on Beauty Booth website
const categoryItems: MegaItem[] = [
  { 
    label: "Monsoon Sale", 
    href: "/sale/monsoon",
  },
  { 
    label: "J-Beauty", 
    href: "/j-beauty",
  },
  { 
    label: "Combo", 
    href: "/combo",
  },
  { 
    label: "Price Drop", 
    href: "/price-drop",
  },
  { 
    label: "New", 
    href: "/new",
  },
  { 
    label: "Brands", 
    href: "/brands",
  },
  { 
    label: "Best Selling", 
    href: "/best-selling",
  },
  {
    label: "Skin Care",
    href: "/skincare",
    columns: [
      {
        title: "Serums & Treatments",
        items: [
          { label: "Serum", href: "/skincare/serum" },
          { label: "Ampoules", href: "/skincare/ampoules" },
          { label: "Essences", href: "/skincare/essences" },
          { label: "Blemish Treatments", href: "/skincare/blemish-treatments" },
          { label: "Essential Oil", href: "/skincare/essential-oil" }
        ]
      },
      {
        title: "Basic Care",
        items: [
          { label: "Acne Treatment", href: "/skincare/acne-treatment" },
          { label: "Moisturizers", href: "/skincare/moisturizers" },
          { label: "Sun Protection", href: "/skincare/sun-protection" },
          { label: "Cleansers", href: "/skincare/cleansers" }
        ]
      },
      {
        title: "Moisturizers",
        items: [
          { label: "Moisturizer Cream", href: "/skincare/moisturizer-cream" },
          { label: "Face Oil", href: "/skincare/face-oil" },
          { label: "Soothing Gel", href: "/skincare/soothing-gel" },
          { label: "Night Cream", href: "/skincare/night-cream" },
          { label: "Whitening Cream", href: "/skincare/whitening-cream" }
        ]
      },
      {
        title: "Cleansers",
        items: [
          { label: "Facial Washes", href: "/skincare/facial-washes" },
          { label: "Makeup Removers", href: "/skincare/makeup-removers" },
          { label: "Cleansing Bars", href: "/skincare/cleansing-bars" },
          { label: "Toner Pads", href: "/skincare/toner-pads" }
        ]
      },
      {
        title: "Face Masks & More",
        items: [
          { label: "Face Scrub", href: "/skincare/face-scrub" },
          { label: "Sheet Mask", href: "/skincare/sheet-mask" },
          { label: "Pimple Patches", href: "/skincare/pimple-patches" },
          { label: "Clay Masks", href: "/skincare/clay-masks" },
          { label: "Eye Cream", href: "/skincare/eye-cream" }
        ]
      }
    ]
  },
  {
    label: "Make up",
    href: "/makeup",
    columns: [
      {
        title: "Face",
        items: [
          { label: "Primers", href: "/makeup/primers" },
          { label: "Foundation", href: "/makeup/foundation" },
          { label: "Powders & Setting Spray", href: "/makeup/powders-setting" },
          { label: "Concealers & Correctors", href: "/makeup/concealers" },
          { label: "BB Creams", href: "/makeup/bb-creams" },
          { label: "CC Cream", href: "/makeup/cc-cream" }
        ]
      },
      {
        title: "Eyes",
        items: [
          { label: "Eyebrows", href: "/makeup/eyebrows" },
          { label: "Eyeliners", href: "/makeup/eyeliners" },
          { label: "Mascara", href: "/makeup/mascara" },
          { label: "Eye Shadow", href: "/makeup/eye-shadow" },
          { label: "Kajal", href: "/makeup/kajal" }
        ]
      },
      {
        title: "Cheeks",
        items: [
          { label: "Blushes", href: "/makeup/blushes" },
          { label: "Highlighters", href: "/makeup/highlighters" },
          { label: "Contour & Bronzers", href: "/makeup/contour-bronzers" }
        ]
      },
      {
        title: "Lips",
        items: [
          { label: "Lipstick", href: "/makeup/lipstick" },
          { label: "Lip Tints", href: "/makeup/lip-tints" },
          { label: "Lip Glosses", href: "/makeup/lip-glosses" },
          { label: "Lip Liner", href: "/makeup/lip-liner" }
        ]
      },
      {
        title: "Tools",
        items: [
          { label: "Makeup Tools", href: "/makeup/tools" }
        ]
      }
    ]
  },
  { 
    label: "Accessories", 
    href: "/accessories",
  },
  {
    label: "Bath & Body Care",
    href: "/bath-body",
    columns: [
      {
        title: "Body Care",
        items: [
          { label: "Body Cleansers", href: "/bath-body/body-cleansers" },
          { label: "Body Oils and Balms", href: "/bath-body/body-oils-balms" },
          { label: "Exfoliators & Scrubs", href: "/bath-body/exfoliators-scrubs" },
          { label: "Hands & Feet", href: "/bath-body/hands-feet" },
          { label: "Body Creams", href: "/bath-body/body-creams" }
        ]
      },
      {
        title: "Hair Care",
        items: [
          { label: "Shampoo", href: "/bath-body/shampoo" },
          { label: "Conditioners", href: "/bath-body/conditioners" },
          { label: "Hair Oil", href: "/bath-body/hair-oil" },
          { label: "Hair Treatments", href: "/bath-body/hair-treatments" },
          { label: "Hair Color", href: "/bath-body/hair-color" }
        ]
      },
      {
        title: "Personal Care",
        items: [
          { label: "Shower Gel", href: "/bath-body/shower-gel" },
          { label: "Hand Cream", href: "/bath-body/hand-cream" },
          { label: "Fragrance", href: "/bath-body/fragrance" },
          { label: "Oral Care", href: "/bath-body/oral-care" }
        ]
      }
    ]
  },
  {
    label: "Mom & Baby Care",
    href: "/mom-baby",
    columns: [
      {
        title: "Baby Care",
        items: [
          { label: "Baby Skincare", href: "/mom-baby/baby-skincare" },
          { label: "Baby Bath", href: "/mom-baby/baby-bath" },
          { label: "Baby Hair Care", href: "/mom-baby/baby-hair-care" }
        ]
      },
      {
        title: "Mother Care",
        items: [
          { label: "Maternity Skincare", href: "/mom-baby/maternity-skincare" },
          { label: "Stretch Mark Care", href: "/mom-baby/stretch-mark-care" }
        ]
      }
    ]
  },
  { 
    label: "Body Scrub", 
    href: "/body-scrub",
  },
  {
    label: "Men's Care",
    href: "/mens-care",
    columns: [
      {
        title: "Face Care",
        items: [
          { label: "Moisturizer for Men", href: "/mens-care/moisturizer" },
          { label: "Men's Face Wash", href: "/mens-care/face-wash" },
          { label: "Scrub", href: "/mens-care/scrub" }
        ]
      },
      {
        title: "Hair Care",
        items: [
          { label: "Hair Care", href: "/mens-care/hair-care" }
        ]
      }
    ]
  }
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader onMenuOpen={handleMobileMenuOpen} />
      
      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-[9999] bg-white border-b border-gray-200 w-full">
        {/* Top Bar */}
        <div className="w-full">
          <TopBar />
        </div>
        
        {/* Header with Navigation */}
        <header className="bg-white border-b border-gray-200">
          {/* Navigation Menu */}
          <div className="bg-white border-t border-gray-100">
            <div className="container-herlan">
              <MegaMenu items={categoryItems} />
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        categories={categoryItems}
      />
    </>
  );
}
