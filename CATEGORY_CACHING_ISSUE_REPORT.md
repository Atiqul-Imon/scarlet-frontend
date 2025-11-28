# Category Listing Page Caching Issue - Analysis Report

## 🔍 Problem Summary

Users are seeing the **same products across all category pages** when navigating directly to category URLs. However, when clicking category filters in the sidebar, correct products appear. Homepage "View All" buttons also show incorrect products.

---

## 🐛 Root Causes Identified

### 1. **API Proxy Cache Key Issue** (CRITICAL)
**File:** `frontend/src/app/api/catalog/[...path]/route.ts`

**Problem:**
- The cache is based on **path only**, not query parameters
- `/catalog/products` is cached the same regardless of `?category=xxx` query param
- This causes all category requests to return the same cached response

**Current Code:**
```typescript
// Line 43: Cache based on path only
next: { revalidate: getCacheDuration(path) }

// Line 35: Query string is included in backend URL but not in cache key
const backendUrl = `${BACKEND_URL}/api/catalog/${path}${queryString ? `?${queryString}` : ''}`;
```

**Impact:**
- First category request: `/catalog/products?category=hair-band` → Cached as `/catalog/products`
- Second category request: `/catalog/products?category=baby-care` → Returns same cache from first request
- Result: All categories show same products

---

### 2. **Products Page Initial Load Race Condition** (HIGH)
**File:** `frontend/src/app/products/page.tsx`

**Problem:**
- Initial load effect (line 192-238) runs with empty dependency array `[]`
- At that time, `filters.category` might be undefined because:
  - URL param effect (line 185-189) might not have run yet
  - Categories array might not be loaded yet, so `buildQueryParams` can't find category ID
- This causes initial load to fetch products without category filter

**Current Code:**
```typescript
// Line 185-189: Sets filter from URL (might run after initial load)
React.useEffect(() => {
  if (categoryParam) {
    setFilters(prev => ({ ...prev, category: categoryParam }));
  }
}, [categoryParam]);

// Line 192-238: Initial load (runs once, might run before filter is set)
React.useEffect(() => {
  const loadInitialData = async () => {
    // ... categories loading ...
    const queryParams = buildQueryParams(1, filters.category, sortBy); // filters.category might be undefined!
    const productsData = await fetchJson<Product[]>(`/catalog/products?${queryParams}`);
  };
  loadInitialData();
}, []); // Empty deps - only runs once
```

**Impact:**
- When navigating to `/products?category=hair-band`, initial load might fetch all products
- Then filter effect runs and corrects it, but cache already has wrong data

---

### 3. **Filter Query Parameter Not Handled** (MEDIUM)
**File:** `frontend/src/app/products/page.tsx`

**Problem:**
- Products page only handles `category` query param
- Homepage sections use `filter` param: `/products?filter=new`, `/products?filter=coming-soon`
- These are not recognized, so they show all products

**Current Code:**
```typescript
// Line 183: Only reads 'category' param
const categoryParam = searchParams.get('category');

// No handling for 'filter' param
```

**Homepage Links:**
```typescript
// frontend/src/app/page.tsx
viewAllLink="/products?filter=new"           // ❌ Not handled
viewAllLink="/products?filter=coming-soon"   // ❌ Not handled
```

**Impact:**
- "New Arrivals" View All → Shows all products
- "Coming Soon" View All → Shows all products

---

## 🔧 Solutions Required

### Fix 1: Include Query Parameters in Cache Key
**File:** `frontend/src/app/api/catalog/[...path]/route.ts`

**Change:**
- Include query string in cache key generation
- Use full URL (path + query) for cache identification

### Fix 2: Fix Initial Load Race Condition
**File:** `frontend/src/app/products/page.tsx`

**Change:**
- Wait for categories to load before initial product fetch
- Read category from URL params directly in initial load
- Ensure filter is set before fetching products

### Fix 3: Handle Filter Query Parameter
**File:** `frontend/src/app/products/page.tsx`

**Change:**
- Read `filter` query param from URL
- Map filter values to appropriate API endpoints:
  - `filter=new` → `/catalog/products/homepage/new-arrivals`
  - `filter=coming-soon` → `/catalog/products/homepage/coming-soon`
  - Or use appropriate query params

---

## 📊 Expected Impact

### Before Fix:
- ❌ All category pages show same products
- ❌ Homepage "View All" buttons show wrong products
- ❌ Poor user experience
- ❌ Incorrect product listings

### After Fix:
- ✅ Each category shows correct products
- ✅ Homepage "View All" buttons work correctly
- ✅ Proper cache invalidation per category
- ✅ Correct product filtering

---

## 🚨 Priority

**CRITICAL** - This is a major UX issue affecting core functionality.

---

## ✅ Fixes Implemented

### Fix 1: Query Parameters in Cache Key ✅
**File:** `frontend/src/app/api/catalog/[...path]/route.ts`

**Changes:**
- Sort query parameters alphabetically to ensure consistent cache keys
- This prevents duplicate cache entries for the same logical request
- Next.js fetch cache already uses full URL (including query params) as cache key

### Fix 2: Initial Load Race Condition ✅
**File:** `frontend/src/app/products/page.tsx`

**Changes:**
- Read category/filter directly from URL params in initial load
- Wait for categories to load before fetching products
- Set filters state immediately from URL params
- Use URL params directly instead of relying on state for initial fetch

### Fix 3: Filter Query Parameter Support ✅
**File:** `frontend/src/app/products/page.tsx`

**Changes:**
- Added support for `filter` query parameter
- Map filter values to appropriate API endpoints:
  - `filter=new` → `/catalog/products/homepage/new-arrivals`
  - `filter=coming-soon` → `/catalog/products/homepage/coming-soon`
- Handle special filter cases in both initial load and filter change effects
- Disable pagination for homepage section filters (they return all products)

---

## 📝 Testing Checklist

After fixes:
- [ ] Navigate to `/products?category=hair-band` → Should show hair band products
- [ ] Navigate to `/products?category=baby-care` → Should show baby care products
- [ ] Click "View All" from "New Arrivals" → Should show new arrivals
- [ ] Click "View All" from "Coming Soon" → Should show coming soon products
- [ ] Click category filter in sidebar → Should still work correctly
- [ ] Verify cache is working (check Network tab for cache headers)
- [ ] Verify different categories return different cached responses
- [ ] Test infinite scroll on category pages (should work)
- [ ] Test that homepage section filters don't show pagination

