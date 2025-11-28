# Homepage Section vs Category Conflict - Fix

## 🔍 Problem

1. **Homepage Section Conflict**: 
   - "Skincare Essentials" homepage section conflicted with root category "Skin Care"
   - "Makeup Collection" homepage section conflicted with root category "Makeup"
   - Both were using the same query parameter (`category=skincare` or `category=makeup`)
   - Homepage sections should use special API endpoints, not category filtering

2. **Sidebar Filter Issue**: 
   - Category detail page sidebar filters were not working correctly
   - Filter changes weren't properly triggering product refetch

---

## ✅ Solution

### Fix 1: Homepage Sections Use Filter Parameter

**File:** `frontend/src/app/page.tsx`

**Changes:**
- Changed `viewAllLink` for "Skincare Essentials" from `/skincare` to `/products?filter=skincare-essentials`
- Changed `viewAllLink` for "Makeup Collection" from `/makeup` to `/products?filter=makeup-collection`
- This ensures homepage sections use `filter=` parameter, not `category=` parameter

**Before:**
```tsx
viewAllLink="/skincare"  // Redirects to /products?category=skincare (root category)
viewAllLink="/makeup"   // Redirects to /products?category=makeup (root category)
```

**After:**
```tsx
viewAllLink="/products?filter=skincare-essentials"  // Uses homepage section API
viewAllLink="/products?filter=makeup-collection"     // Uses homepage section API
```

---

### Fix 2: Products Page Handles Homepage Section Filters

**File:** `frontend/src/app/products/page.tsx`

**Changes:**
- Added handling for `filter=skincare-essentials` and `filter=makeup-collection`
- These filters now use special API endpoints:
  - `/catalog/products/homepage/skincare-essentials`
  - `/catalog/products/homepage/makeup-collection`
- Homepage section filters are handled in both initial load and filter change effects

**Code:**
```typescript
// Handle special filter endpoints (homepage sections)
if (filterParam === 'skincare-essentials') {
  const productsData = await fetchJson<Product[]>(`/catalog/products/homepage/skincare-essentials`);
  setProducts(productsData);
  setHasMore(false); // Homepage sections don't use pagination
} else if (filterParam === 'makeup-collection') {
  const productsData = await fetchJson<Product[]>(`/catalog/products/homepage/makeup-collection`);
  setProducts(productsData);
  setHasMore(false); // Homepage sections don't use pagination
}
```

---

### Fix 3: Sidebar Filter Updates URL

**File:** `frontend/src/app/products/page.tsx`

**Changes:**
- Updated `handleFilterChange` to update URL when category filter changes
- When a category filter is selected, it:
  1. Updates the filters state
  2. Clears any `filter` param (homepage sections)
  3. Sets the `category` param in URL
  4. Triggers navigation which causes initial load effect to refetch

**Code:**
```typescript
const handleFilterChange = (filterType: string, value: string | null) => {
  // Update filters state
  setFilters(prev => ({
    ...prev,
    [filterType]: value
  }));
  
  // Update URL to reflect filter change (for category filter)
  if (filterType === 'category' && value) {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete('filter'); // Remove filter param for homepage sections
    newSearchParams.set('category', value);
    router.push(`/products?${newSearchParams.toString()}`, { scroll: false });
  } else if (filterType === 'category' && !value) {
    // Clear category from URL
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete('category');
    newSearchParams.delete('filter');
    router.push(`/products?${newSearchParams.toString()}`, { scroll: false });
  }
};
```

---

## 📊 Separation of Concerns

### Homepage Sections (Managed from Admin Panel)
- Use `filter=` parameter
- Use special API endpoints: `/catalog/products/homepage/{section}`
- Examples:
  - `filter=new` → `/catalog/products/homepage/new-arrivals`
  - `filter=coming-soon` → `/catalog/products/homepage/coming-soon`
  - `filter=skincare-essentials` → `/catalog/products/homepage/skincare-essentials`
  - `filter=makeup-collection` → `/catalog/products/homepage/makeup-collection`

### Root Categories (Dynamic from Database)
- Use `category=` parameter
- Use category filtering API: `/catalog/products?category={categoryId}`
- Examples:
  - `category=skincare` → `/catalog/products?category={skincareCategoryId}`
  - `category=makeup` → `/catalog/products?category={makeupCategoryId}`

---

## ✅ Expected Behavior

### Homepage Sections:
- ✅ "Skincare Essentials" View All → Shows only products with `homepageSection: 'skincare-essentials'`
- ✅ "Makeup Collection" View All → Shows only products with `homepageSection: 'makeup-collection'`
- ✅ No conflict with root categories

### Root Categories:
- ✅ `/products?category=skincare` → Shows all products in "Skin Care" category
- ✅ `/products?category=makeup` → Shows all products in "Makeup" category
- ✅ Sidebar filters work correctly

### Sidebar Filters:
- ✅ Clicking category filter updates URL and refetches products
- ✅ Filter state and URL stay in sync
- ✅ Works correctly on category detail pages

---

## 🧪 Testing

1. **Homepage Sections:**
   - Click "View All" from "Skincare Essentials" → Should show only homepage section products
   - Click "View All" from "Makeup Collection" → Should show only homepage section products
   - Verify URL shows `filter=skincare-essentials` or `filter=makeup-collection`

2. **Root Categories:**
   - Navigate to `/products?category=skincare` → Should show all skincare category products
   - Navigate to `/products?category=makeup` → Should show all makeup category products
   - Verify different products than homepage sections

3. **Sidebar Filters:**
   - On a category page, click a different category in sidebar
   - Verify URL updates and products refetch
   - Verify correct products are shown

---

## 📝 Notes

- Homepage sections are separate from root categories
- Homepage sections are managed from admin panel (product creation page)
- Root categories are dynamic from database
- Both can coexist without conflict
- Sidebar filters now properly update URL and trigger refetch

