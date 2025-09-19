# Hero Image Responsive Guidelines

## Overview
This document outlines the responsive hero image system implemented in the Scarlet e-commerce application. The system uses 6 different image variants to ensure optimal display across all device sizes.

## Image Breakpoints & Specifications

### 1. Mobile Small (320px - 479px)
- **File**: `newhero01_mobile_small_320x200.webp`
- **Dimensions**: 320px × 200px
- **Aspect Ratio**: 16:10
- **Tailwind Class**: `sm:hidden`
- **Container Height**: `min-h-[200px]`

### 2. Mobile Large (480px - 767px)
- **File**: `newhero01_mobile_large_480x300.webp`
- **Dimensions**: 480px × 300px
- **Aspect Ratio**: 16:10
- **Tailwind Class**: `hidden sm:block md:hidden`
- **Container Height**: `min-h-[250px]`

### 3. Tablet Small (768px - 1023px)
- **File**: `newhero01_tablet_small_768x400.webp`
- **Dimensions**: 768px × 400px
- **Aspect Ratio**: 1.92:1
- **Tailwind Class**: `hidden md:block lg:hidden`
- **Container Height**: `min-h-[300px]`

### 4. Tablet Large (1024px - 1199px)
- **File**: `newhero01_tablet_large_1024x500.webp`
- **Dimensions**: 1024px × 500px
- **Aspect Ratio**: 2.048:1
- **Tailwind Class**: `hidden lg:block xl:hidden`
- **Container Height**: `min-h-[350px]`

### 5. Desktop Small (1200px - 1439px)
- **File**: `newhero01_desktop_small_1200x600.webp`
- **Dimensions**: 1200px × 600px
- **Aspect Ratio**: 2:1
- **Tailwind Class**: `hidden xl:block 2xl:hidden`
- **Container Height**: `min-h-[400px]`

### 6. Desktop Large (1440px+)
- **File**: `newhero01_desktop_large_1920x800.webp`
- **Dimensions**: 1920px × 800px
- **Aspect Ratio**: 2.4:1
- **Tailwind Class**: `hidden 2xl:block`
- **Container Height**: `min-h-[450px]`

## File Structure

```
frontend/
├── public/
│   └── images/
│       └── hero/
│           ├── newhero01_mobile_small_320x200.webp
│           ├── newhero01_mobile_large_480x300.webp
│           ├── newhero01_tablet_small_768x400.webp
│           ├── newhero01_tablet_large_1024x500.webp
│           ├── newhero01_desktop_small_1200x600.webp
│           └── newhero01_desktop_large_1920x800.webp
└── src/
    └── components/
        └── hero/
            └── Hero.tsx
```

## Implementation Details

### Component Structure
The hero component uses a responsive image system with the following key features:

1. **Interface Definition**:
```typescript
interface BannerSlide {
  id: number;
  title: string;
  backgroundImage: {
    mobileSmall: string;    // 320x200px
    mobileLarge: string;    // 480x300px
    tabletSmall: string;    // 768x400px
    tabletLarge: string;    // 1024x500px
    desktopSmall: string;   // 1200x600px
    desktopLarge: string;   // 1920x800px
  };
}
```

2. **Responsive Classes**:
- Each image variant is hidden/shown using Tailwind responsive classes
- Images are positioned absolutely within their containers
- All images use `object-contain` to prevent cropping
- Rounded corners (`rounded-xl`) are applied consistently

3. **Performance Optimizations**:
- All images use WebP format for optimal compression
- Proper `sizes` attributes for responsive loading
- `priority` loading for the first slide
- Quality set to 85% for optimal balance

## Image Creation Guidelines

### Design Principles
1. **Consistent Composition**: Maintain the same focal point and composition across all variants
2. **Aspect Ratio Awareness**: Design for the specific aspect ratio of each breakpoint
3. **Content Safety**: Ensure important visual elements are within the safe area for all sizes
4. **Brand Consistency**: Maintain consistent styling, colors, and branding across all variants

### Technical Requirements
1. **Format**: Always use WebP format for optimal performance
2. **Quality**: Use 85% quality for the best balance of file size and visual quality
3. **Optimization**: Compress images using tools like ImageOptim, TinyPNG, or similar
4. **Naming Convention**: Follow the pattern `newhero01_[breakpoint]_[width]x[height].webp`

### Image Content Guidelines
1. **Model Positioning**: Ensure the model is properly centered and visible in all variants
2. **Text Overlay**: If text is included, ensure it's readable across all sizes
3. **Background**: Maintain consistent background styling across all variants
4. **Brand Elements**: Include consistent brand elements (logos, colors) where appropriate

## Adding New Hero Images

### Step 1: Create Image Variants
1. Create 6 versions of your hero image with the exact dimensions specified above
2. Save them in the `/public/images/hero/` directory
3. Follow the naming convention: `[name]_[breakpoint]_[width]x[height].webp`

### Step 2: Update Component
1. Open `/src/components/hero/Hero.tsx`
2. Update the `bannerSlides` array with your new image paths:
```typescript
const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Your Title",
    backgroundImage: {
      mobileSmall: "/images/hero/your_mobile_small_320x200.webp",
      mobileLarge: "/images/hero/your_mobile_large_480x300.webp",
      tabletSmall: "/images/hero/your_tablet_small_768x400.webp",
      tabletLarge: "/images/hero/your_tablet_large_1024x500.webp",
      desktopSmall: "/images/hero/your_desktop_small_1200x600.webp",
      desktopLarge: "/images/hero/your_desktop_large_1920x800.webp"
    }
  }
];
```

### Step 3: Test Responsiveness
1. Test on various device sizes using browser dev tools
2. Verify images load correctly at each breakpoint
3. Check that no cropping occurs and images display properly
4. Ensure smooth transitions between breakpoints

## Troubleshooting

### Common Issues
1. **Image Not Loading**: Check file paths and ensure images exist in the correct directory
2. **Cropping Issues**: Verify `object-contain` is applied and container heights are appropriate
3. **Performance Issues**: Ensure images are properly optimized and in WebP format
4. **Layout Issues**: Check that responsive classes are correctly applied

### Debug Tips
1. Use browser dev tools to inspect which image variant is loading
2. Check console for any image loading errors
3. Verify Tailwind classes are being applied correctly
4. Test on actual devices when possible

## Maintenance

### Regular Tasks
1. **Image Optimization**: Periodically re-optimize images as tools improve
2. **Performance Monitoring**: Monitor Core Web Vitals for image loading performance
3. **A/B Testing**: Test different hero images to optimize conversion rates
4. **Accessibility**: Ensure images have proper alt text and are accessible

### Updates
1. **New Breakpoints**: If new device sizes emerge, add appropriate breakpoints
2. **Format Updates**: Consider newer formats like AVIF when browser support improves
3. **Component Updates**: Keep the Hero component updated with latest Next.js Image optimizations

## Contact
For questions or issues with the hero image system, contact the development team or refer to the main project documentation.

---
*Last Updated: [Current Date]*
*Version: 1.0*
