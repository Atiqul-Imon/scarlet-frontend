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
  onSelectionsChange: (selections: VariantSelection[]) => void;
  initialSelections?: VariantSelection[];
}

export default function MultipleVariantSelector({
  sizes = [],
  colors = [],
  maxStock = 999,
  onSelectionsChange,
  initialSelections = []
}: MultipleVariantSelectorProps) {
  const [selections, setSelections] = React.useState<VariantSelection[]>(initialSelections);

  // Generate unique ID for a combination
  const getVariantId = (size: string, color: string): string => {
    return `${size || 'no-size'}_${color || 'no-color'}`;
  };

  // Check if a combination already exists (exact match)
  const findSelection = (size: string, color: string): VariantSelection | undefined => {
    return selections.find(s => 
      (s.size || '') === (size || '') && 
      (s.color || '') === (color || '')
    );
  };

  // Add a new variant combination
  const addVariant = (size: string, color: string) => {
    const existing = findSelection(size, color);
    if (existing) {
      // If exists, just increment quantity (if within stock limit)
      updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const newSelection: VariantSelection = {
        size,
        color,
        quantity: 1,
        id: getVariantId(size, color)
      };
      const updated = [...selections, newSelection];
      setSelections(updated);
      onSelectionsChange(updated);
    }
  };

  // Update quantity for a specific variant
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      newQuantity = maxStock;
    }
    
    const updated = selections.map(s => 
      s.id === id ? { ...s, quantity: newQuantity } : s
    );
    setSelections(updated);
    onSelectionsChange(updated);
  };

  // Remove a variant combination
  const removeVariant = (id: string) => {
    const updated = selections.filter(s => s.id !== id);
    setSelections(updated);
    onSelectionsChange(updated);
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
        {/* Size Selection */}
        {normalizedSizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-900">
              Select Size <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {normalizedSizes.map((size: string, index: number) => (
                <button
                  key={`size-${size}-${index}`}
                  type="button"
                  onClick={() => {
                    // When size is clicked, add it with empty color (user can select color later or add as-is)
                    addVariant(size, '');
                  }}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    selections.some(s => s.size === size && !s.color)
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {normalizedColors.length > 0 && (
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-900">
              Select Color <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {normalizedColors.map((color: string, index: number) => (
                <button
                  key={`color-${color}-${index}`}
                  type="button"
                  onClick={() => {
                    // When color is clicked, add it with empty size (user can select size later or add as-is)
                    addVariant('', color);
                  }}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    selections.some(s => s.color === color && !s.size)
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Combination Builder - Grid of Size x Color */}
        {(normalizedSizes.length > 0 && normalizedColors.length > 0) && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="text-base font-semibold text-gray-900">
              Select Combinations <span className="text-gray-500 text-sm font-normal">(Click to add to cart)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {normalizedSizes.map((size: string) => (
                normalizedColors.map((color: string) => {
                  const variantId = getVariantId(size, color);
                  const selection = findSelection(size, color);
                  const isActive = !!selection;

                  return (
                    <button
                      key={variantId}
                      type="button"
                      onClick={() => addVariant(size, color)}
                      className={`px-3 py-2.5 border-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{size}</span>
                        <span className="text-xs opacity-75">/</span>
                        <span>{color}</span>
                        {isActive && (
                          <span className="mt-1 text-xs font-bold bg-red-600 text-white px-2 py-0.5">
                            Qty: {selection.quantity}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Variants List */}
      {selections.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <label className="text-base font-semibold text-gray-900">
            Selected Items ({getTotalQuantity()} total)
          </label>
          <div className="space-y-2">
            {selections.map((selection) => (
              <div
                key={selection.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {selection.size && (
                      <span className="font-medium">Size: {selection.size}</span>
                    )}
                    {selection.size && selection.color && <span>•</span>}
                    {selection.color && (
                      <span className="font-medium">Color: {selection.color}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(selection.id, selection.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-700"
                      disabled={selection.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-900">
                      {selection.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(selection.id, selection.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-700"
                      disabled={selection.quantity >= maxStock || getTotalQuantity() >= maxStock}
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeVariant(selection.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    aria-label="Remove variant"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
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

