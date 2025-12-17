"use client";
import * as React from 'react';

export interface VariantSelection {
  size: string;
  color: string;
  quantity: number;
  id: string; // Unique ID for this combination
}

interface MultipleVariantSelectorProps {
  sizes?: string[] | undefined;
  colors?: string[] | undefined;
  maxStock?: number;
  variantStock?: Record<string, number>; // Stock per variant combination
  onSelectionsChange: (selections: VariantSelection[]) => void;
  initialSelections?: VariantSelection[];
  onVariantPreview?: (size: string, color: string) => void; // Callback when variant is being previewed (selected but not yet added)
}

export default function MultipleVariantSelector({
  sizes = [],
  colors = [],
  maxStock = 999,
  variantStock,
  onSelectionsChange,
  initialSelections = [],
  onVariantPreview
}: MultipleVariantSelectorProps) {
  const [selections, setSelections] = React.useState<VariantSelection[]>(initialSelections);
  const [selectedSizeForCombination, setSelectedSizeForCombination] = React.useState<string>('');
  const [selectedColorForCombination, setSelectedColorForCombination] = React.useState<string>('');

  // Generate unique ID for a combination
  const getVariantId = (size: string, color: string): string => {
    return `${size || 'no-size'}_${color || 'no-color'}`;
  };

  // Get stock for a specific variant
  const getVariantStock = (size: string, color: string): number => {
    if (!variantStock) return maxStock;
    const key = getVariantId(size, color);
    return variantStock[key] || 0;
  };

  // Memoize stock checks to avoid repeated calculations
  const stockCheckCache = React.useRef<Map<string, boolean>>(new Map());
  
  // Check if variant is in stock (memoized)
  const isVariantInStock = React.useCallback((size: string, color: string): boolean => {
    if (!variantStock) return true; // If no variant stock, assume in stock
    const key = `${size || 'no-size'}_${color || 'no-color'}`;
    
    // Check cache first
    if (stockCheckCache.current.has(key)) {
      return stockCheckCache.current.get(key)!;
    }
    
    const inStock = getVariantStock(size, color) > 0;
    stockCheckCache.current.set(key, inStock);
    return inStock;
  }, [variantStock, maxStock]);
  
  // Clear cache when variantStock changes
  React.useEffect(() => {
    stockCheckCache.current.clear();
  }, [variantStock]);

  // Track if component has mounted to avoid unnecessary initial sync
  const isMountedRef = React.useRef(false);

  // Sync selections to parent component (prevents setState during render)
  React.useEffect(() => {
    // Only sync after initial mount to avoid unnecessary parent updates
    if (isMountedRef.current) {
      onSelectionsChange(selections);
    } else {
      isMountedRef.current = true;
      // Sync initial state on mount
      if (selections.length > 0) {
        onSelectionsChange(selections);
      }
    }
  }, [selections, onSelectionsChange]);

  // Sync initialSelections from parent when they change
  const prevInitialSelectionsRef = React.useRef<string>('');
  React.useEffect(() => {
    // Only update if initialSelections actually changed
    if (initialSelections && initialSelections.length > 0) {
      const initialIds = initialSelections.map(s => s.id).sort().join(',');
      if (prevInitialSelectionsRef.current !== initialIds) {
        prevInitialSelectionsRef.current = initialIds;
        setSelections(initialSelections);
      }
    } else if (initialSelections && initialSelections.length === 0) {
      // Handle empty initial selections
      if (prevInitialSelectionsRef.current !== '') {
        prevInitialSelectionsRef.current = '';
        setSelections([]);
      }
    }
  }, [initialSelections]);

  // Add a new variant combination
  const addVariant = React.useCallback((size: string, color: string) => {
    // Check if variant is in stock
    if (!isVariantInStock(size, color)) {
      return; // Don't add out-of-stock variants
    }

    setSelections(prevSelections => {
      const existing = prevSelections.find(s => 
        (s.size || '') === (size || '') && 
        (s.color || '') === (color || '')
      );
      
      if (existing) {
        // If exists, just increment quantity (if within stock limit)
        const variantStockLimit = getVariantStock(size, color);
        const newQuantity = Math.min(existing.quantity + 1, variantStockLimit);
        if (newQuantity < 1) return prevSelections;
        
        return prevSelections.map(s => 
          s.id === existing.id ? { ...s, quantity: newQuantity } : s
        );
      } else {
        // Add new combination with quantity 1
        const newSelection: VariantSelection = {
          size,
          color,
          quantity: 1,
          id: getVariantId(size, color)
        };
        return [...prevSelections, newSelection];
      }
    });
  }, [isVariantInStock, maxStock, variantStock]);

  // Auto-add combination when both size and color are selected
  React.useEffect(() => {
    if (selectedSizeForCombination && selectedColorForCombination) {
      addVariant(selectedSizeForCombination, selectedColorForCombination);
      // Clear selections after adding so user can select new combination
      setSelectedSizeForCombination('');
      setSelectedColorForCombination('');
    }
  }, [selectedSizeForCombination, selectedColorForCombination, addVariant]);

  // Update quantity for a specific variant
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const selection = selections.find(s => s.id === id);
    if (selection) {
      const variantStockLimit = getVariantStock(selection.size, selection.color);
      if (newQuantity > variantStockLimit) {
        newQuantity = variantStockLimit;
      }
    } else {
      if (newQuantity > maxStock) {
        newQuantity = maxStock;
      }
    }
    
    setSelections(prevSelections => 
      prevSelections.map(s => 
        s.id === id ? { ...s, quantity: newQuantity } : s
      )
    );
  };

  // Remove a variant combination
  const removeVariant = (id: string) => {
    const removedSelection = selections.find(s => s.id === id);
    setSelections(prevSelections => 
      prevSelections.filter(s => s.id !== id)
    );
    
    // Clear preview when variant is removed
    if (removedSelection && onVariantPreview) {
      // Clear preview by passing empty strings
      onVariantPreview('', '');
    }
  };

  // Get total quantity across all selections
  const getTotalQuantity = (): number => {
    return selections.reduce((sum, s) => sum + s.quantity, 0);
  };

  // Normalize arrays to handle different input formats
  const normalizedSizes = React.useMemo((): string[] => {
    if (!sizes) return [];
    if (Array.isArray(sizes)) {
      return sizes.filter((s: any) => s && String(s).trim());
    }
    const sizesStr = String(sizes);
    if (sizesStr.includes(',')) {
      return sizesStr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    return sizesStr.trim() ? [sizesStr.trim()] : [];
  }, [sizes]);

  const normalizedColors = React.useMemo((): string[] => {
    if (!colors) return [];
    if (Array.isArray(colors)) {
      return colors.filter((c: any) => c && String(c).trim());
    }
    const colorsStr = String(colors);
    if (colorsStr.includes(',')) {
      return colorsStr.split(',').map((c: string) => c.trim()).filter((c: string) => c);
    }
    return colorsStr.trim() ? [colorsStr.trim()] : [];
  }, [colors]);

  const hasVariants = normalizedSizes.length > 0 || normalizedColors.length > 0;

  if (!hasVariants) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Size and Color Selection Grid */}
      <div className="space-y-4">
        {/* Size Selection - Only show individual selectors when both exist */}
        {normalizedSizes.length > 0 && normalizedColors.length === 0 && (
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>Select Size</span>
              <span className="text-rose-600 text-sm">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {normalizedSizes.map((size: string, index: number) => {
                const isSelected = selections.some(s => s.size === size && !s.color);
                return (
                  <button
                    key={`size-${size}-${index}`}
                    type="button"
                    onClick={() => addVariant(size, '')}
                    className={`group relative px-5 py-2.5 sm:px-6 sm:py-3 border-2 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 shadow-md shadow-rose-200/50'
                        : 'border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50/50 hover:to-pink-50/50 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="relative z-10">{size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Selection - Only show individual selectors when both exist */}
        {normalizedColors.length > 0 && normalizedSizes.length === 0 && (
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>Select Color</span>
              <span className="text-rose-600 text-sm">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {normalizedColors.map((color: string, index: number) => {
                const isSelected = selections.some(s => s.color === color && !s.size);
                return (
                  <button
                    key={`color-${color}-${index}`}
                    type="button"
                    onClick={() => addVariant('', color)}
                    className={`group relative px-5 py-2.5 sm:px-6 sm:py-3 border-2 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 shadow-md shadow-rose-200/50'
                        : 'border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50/50 hover:to-pink-50/50 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="relative z-10">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Combination Builder - When both size and color exist */}
        {(normalizedSizes.length > 0 && normalizedColors.length > 0) && (
          <div className="space-y-5 pt-5 border-t border-rose-100">
            <label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>Select Size and Color</span>
              <span className="text-rose-600 text-sm">*</span>
            </label>
            
            {/* Size Selection for Combination */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>Select Size</span>
                <span className="text-rose-600 text-xs">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {normalizedSizes.map((size: string, index: number) => {
                  const isSelected = selectedSizeForCombination === size;
                  // Check if any color combination with this size is in stock
                  const hasStock = normalizedColors.length === 0 
                    ? isVariantInStock(size, '')
                    : normalizedColors.some(color => isVariantInStock(size, color));
                  
                  return (
                    <button
                      key={`combo-size-${size}-${index}`}
                      type="button"
                      onClick={() => {
                        if (hasStock) {
                          // Toggle selection - allow only one size at a time for combination
                          const newSize = isSelected ? '' : size;
                          setSelectedSizeForCombination(newSize);
                          // Notify parent for image preview
                          if (onVariantPreview) {
                            onVariantPreview(newSize, selectedColorForCombination);
                          }
                        }
                      }}
                      disabled={!hasStock}
                      className={`group relative px-5 py-2.5 sm:px-6 sm:py-3 border-2 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        !hasStock
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 shadow-md shadow-rose-200/50'
                          : 'border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50/50 hover:to-pink-50/50 hover:shadow-sm'
                      }`}
                      title={!hasStock ? 'Out of stock' : ''}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="relative z-10">{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection for Combination */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>Select Color</span>
                <span className="text-rose-600 text-xs">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {normalizedColors.map((color: string, index: number) => {
                  const isSelected = selectedColorForCombination === color;
                  // Check if any size combination with this color is in stock
                  const hasStock = normalizedSizes.length === 0 
                    ? isVariantInStock('', color)
                    : normalizedSizes.some(size => isVariantInStock(size, color));
                  
                  return (
                    <button
                      key={`combo-color-${color}-${index}`}
                      type="button"
                      onClick={() => {
                        if (hasStock) {
                          // Toggle selection - allow only one color at a time for combination
                          const newColor = isSelected ? '' : color;
                          setSelectedColorForCombination(newColor);
                          // Notify parent for image preview
                          if (onVariantPreview) {
                            onVariantPreview(selectedSizeForCombination, newColor);
                          }
                        }
                      }}
                      disabled={!hasStock}
                      className={`group relative px-5 py-2.5 sm:px-6 sm:py-3 border-2 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        !hasStock
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 shadow-md shadow-rose-200/50'
                          : 'border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50/50 hover:to-pink-50/50 hover:shadow-sm'
                      }`}
                      title={!hasStock ? 'Out of stock' : ''}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className="relative z-10">{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-add info message */}
            {selectedSizeForCombination && !selectedColorForCombination && (
              <div className="pt-3 px-4 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl">
                <p className="text-sm text-rose-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Size <span className="font-semibold">{selectedSizeForCombination}</span> selected. Now select a color to add the combination.</span>
                </p>
              </div>
            )}
            {!selectedSizeForCombination && selectedColorForCombination && (
              <div className="pt-3 px-4 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl">
                <p className="text-sm text-rose-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Color <span className="font-semibold">{selectedColorForCombination}</span> selected. Now select a size to add the combination.</span>
                </p>
              </div>
            )}

            {/* Quick Add: Multiple sizes for selected color */}
            {selectedColorForCombination && !selectedSizeForCombination && (
              <div className="pt-4 border-t border-rose-100">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <span>Or add multiple sizes for</span>
                  <span className="px-2.5 py-1 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 rounded-lg font-bold">{selectedColorForCombination}</span>
                </label>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {normalizedSizes.map((size: string, index: number) => (
                    <button
                      key={`quick-size-${size}-${index}`}
                      type="button"
                      onClick={() => addVariant(size, selectedColorForCombination)}
                      className="group px-4 py-2 sm:px-5 sm:py-2.5 border-2 border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      {size} <span className="text-xs text-rose-500 ml-1">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add: Multiple colors for selected size */}
            {selectedSizeForCombination && !selectedColorForCombination && (
              <div className="pt-4 border-t border-rose-100">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <span>Or add multiple colors for</span>
                  <span className="px-2.5 py-1 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 rounded-lg font-bold">{selectedSizeForCombination}</span>
                </label>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {normalizedColors.map((color: string, index: number) => (
                    <button
                      key={`quick-color-${color}-${index}`}
                      type="button"
                      onClick={() => addVariant(selectedSizeForCombination, color)}
                      className="group px-4 py-2 sm:px-5 sm:py-2.5 border-2 border-rose-200 bg-white text-gray-700 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      {color} <span className="text-xs text-rose-500 ml-1">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Variants List */}
      {selections.length > 0 && (
        <div className="space-y-4 pt-5 border-t border-rose-100">
          <label className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>Selected Items</span>
            <span className="px-2.5 py-1 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 rounded-lg text-sm font-bold">
              {getTotalQuantity()} {getTotalQuantity() === 1 ? 'item' : 'items'}
            </span>
          </label>
          <div className="space-y-3">
            {selections.map((selection) => {
              const variantStock = getVariantStock(selection.size, selection.color);
              const variantStockLimit = variantStock || maxStock;
              
              return (
                <div
                  key={selection.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-rose-50/50 to-pink-50/50 border-2 border-rose-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-800">
                      {selection.size && (
                        <span className="px-2.5 sm:px-3 py-1 bg-white border border-rose-200 rounded-lg font-semibold text-rose-700 whitespace-nowrap text-xs sm:text-sm">
                          Size: {selection.size}
                        </span>
                      )}
                      {selection.size && selection.color && (
                        <span className="text-rose-300 hidden sm:inline">•</span>
                      )}
                      {selection.color && (
                        <span className="px-2.5 sm:px-3 py-1 bg-white border border-rose-200 rounded-lg font-semibold text-rose-700 whitespace-nowrap text-xs sm:text-sm">
                          Color: {selection.color}
                        </span>
                      )}
                      {!selection.size && !selection.color && (
                        <span className="text-gray-500 italic text-xs sm:text-sm">No variants</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center border-2 border-rose-200 bg-white rounded-xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(selection.id, selection.quantity - 1)}
                        className="px-2.5 sm:px-3 py-2 hover:bg-rose-50 transition-colors text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={selection.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 sm:w-12 text-center text-sm font-bold text-gray-900 bg-white flex-shrink-0">
                        {selection.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(selection.id, selection.quantity + 1)}
                        className="px-2.5 sm:px-3 py-2 hover:bg-rose-50 transition-colors text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={selection.quantity >= variantStockLimit || getTotalQuantity() >= maxStock}
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeVariant(selection.id)}
                    className="p-2 sm:p-2.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition-all duration-300 rounded-xl flex-shrink-0"
                    aria-label="Remove variant"
                    title="Remove this combination"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {selections.length === 0 && (
        <p className="text-sm text-gray-500">
          {normalizedSizes.length > 0 && normalizedColors.length > 0
            ? 'Select size and color combinations above to add them to your cart'
            : normalizedSizes.length > 0
            ? 'Select sizes above to add them to your cart'
            : 'Select colors above to add them to your cart'}
        </p>
      )}
    </div>
  );
}

