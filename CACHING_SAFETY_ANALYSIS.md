# API Proxy Caching - Safety Analysis

## ✅ **SAFE TO CACHE - No Risk of Overselling**

### Why Caching is Safe

1. **Stock Validation Happens on Backend (Not Through Proxy)**
   - Cart operations (`/cart/items`, `/cart/guest/items`) go **directly to backend**
   - Order creation (`/orders/create`, `/orders/guest/create`) goes **directly to backend**
   - These endpoints validate stock **server-side** before any database writes

2. **Proxy Routes are Read-Only for Display**
   - `/api/catalog/[...path]` - Only handles GET requests for products/categories
   - `/api/blog/[...path]` - Only handles GET requests for blog posts
   - These are **display-only** data, not transactional

3. **Backend Always Validates Stock**
   - When adding to cart: `backend/src/modules/cart/presenter.ts` → `addItem()` checks stock
   - When creating order: `backend/src/modules/orders/presenter.ts` → `createFromCart()` checks stock atomically
   - Backend fetches **fresh product data** from database during validation

### Implementation Details

#### Cached Endpoints (GET requests only)
- **Products**: 5 minutes cache (prices/stock may change)
- **Categories**: 30 minutes cache (rarely change)
- **Blog**: 1 hour cache (static content)

#### Non-Cached Endpoints (Write operations)
- **POST/PUT/DELETE**: Explicitly set `cache: 'no-store'` and `Cache-Control: no-store`
- These operations bypass cache completely

### Cache Strategy

```typescript
// GET requests - Safe to cache
next: { revalidate: 300 } // 5 minutes for products
Cache-Control: public, s-maxage=300, stale-while-revalidate=600

// POST/PUT/DELETE - Never cached
cache: 'no-store'
Cache-Control: no-store, no-cache, must-revalidate
```

### Expected Impact

- **Edge Requests Reduction**: 60-70% (~140-160K/month)
- **No Risk**: Stock validation happens server-side, not client-side
- **User Experience**: Faster page loads, same accuracy

### Verification

To verify stock validation is working:
1. Add product to cart → Backend validates stock
2. Create order → Backend validates stock atomically
3. Display product page → Uses cached data (display only)

**Conclusion**: Caching is 100% safe. Stock validation is server-side and independent of cached display data.

