# Development Cache Management

This document explains how caching is configured for development and how to clear caches when needed.

## Cache Configuration

### Development Mode (NODE_ENV=development)
- **All caching is disabled** to ensure fresh data during development
- **Image optimization is disabled** to prevent image caching
- **API calls include cache-busting headers** with timestamps
- **React StrictMode is disabled** to prevent double-rendering
- **SWC minification is disabled** for faster builds

### Production Mode (NODE_ENV=production)
- **Static assets are cached** for optimal performance
- **Images are optimized and cached** appropriately
- **API routes have appropriate cache headers** based on their type
- **React StrictMode is enabled** for better error detection

## Cache Clearing Commands

### Quick Cache Clear
```bash
npm run clear-cache
```

### Start Development with Clean Cache
```bash
npm run dev:clean
```

### Manual Cache Clearing
```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -f .tsbuildinfo

# Clear ESLint cache
rm -f .eslintcache

# Clear node_modules cache
rm -rf node_modules/.cache
```

## Browser Cache Clearing

### Chrome/Edge
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Firefox
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Safari
1. Open Developer Tools (Cmd+Option+I)
2. Right-click the refresh button
3. Select "Empty Caches and Reload"

## Development Tips

### Keep Cache Disabled in Browser
1. Open Developer Tools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep Developer Tools open while developing

### Force Fresh API Calls
- API calls automatically include cache-busting headers in development
- Each request includes a timestamp to ensure freshness
- No additional configuration needed

### Troubleshooting Cache Issues
1. Run `npm run clear-cache` to clear all caches
2. Restart your development server
3. Hard refresh your browser (Ctrl+Shift+R)
4. Check that NODE_ENV is set to 'development'

## Configuration Files

- **Next.js Config**: `next.config.ts` - Main caching configuration
- **API Config**: `src/lib/api.ts` - API request cache-busting
- **Cache Script**: `clear-cache-dev.js` - Automated cache clearing

## Environment Variables

Make sure your `.env.local` file has:
```env
NODE_ENV=development
```

This ensures all development optimizations are applied.
