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
  const [selectedSizeForCombination, setSelectedSizeForCombination] = React.useState<string>('');
  const [selectedColorForCombination, setSelectedColorForCombination] = React.useState<string>('');

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
      // Add new combination with quantity 1
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
        {/* Size Selection - Only show individual selectors when both exist */}
        {normalizedSizes.length > 0 && normalizedColors.length === 0 && (
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-900">
              Select Size <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {normalizedSizes.map((size: string, index: number) => (
                <button
                  key={`size-${size}-${index}`}
                  type="button"
                  onClick={() => addVariant(size, '')}
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

        {/* Color Selection - Only show individual selectors when both exist */}
        {normalizedColors.length > 0 && normalizedSizes.length === 0 && (
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-900">
              Select Color <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {normalizedColors.map((color: string, index: number) => (
                <button
                  key={`color-${color}-${index}`}
                  type="button"
                  onClick={() => addVariant('', color)}
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

        {/* Combination Builder - When both size and color exist */}
        {(normalizedSizes.length > 0 && normalizedColors.length > 0) && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <label className="text-base font-semibold text-gray-900">
              Select Size and Color Combination
            </label>
            
            {/* Size Selection for Combination - Multiple selection allowed */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Step 1: Select Size(s) <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {normalizedSizes.map((size: string, index: number) => {
                  const isSelected = selectedSizeForCombination === size;
                  return (
                    <button
                      key={`combo-size-${size}-${index}`}
                      type="button"
                      onClick={() => {
                        // Toggle selection - allow only one size at a time for combination
                        setSelectedSizeForCombination(isSelected ? '' : size);
                      }}
                      className={`px-4 py-2 border-2 font-medium transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection for Combination - Multiple selection allowed */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Step 2: Select Color(s) <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {normalizedColors.map((color: string, index: number) => {
                  const isSelected = selectedColorForCombination === color;
                  return (
                    <button
                      key={`combo-color-${color}-${index}`}
                      type="button"
                      onClick={() => {
                        // Toggle selection - allow only one color at a time for combination
                        setSelectedColorForCombination(isSelected ? '' : color);
                      }}
                      className={`px-4 py-2 border-2 font-medium transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Combination Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedSizeForCombination && selectedColorForCombination) {
                    addVariant(selectedSizeForCombination, selectedColorForCombination);
                    // Keep selections active so user can add same combination multiple times or change and add new
                  }
                }}
                disabled={!selectedSizeForCombination || !selectedColorForCombination}
                className={`px-6 py-3 border-2 font-medium transition-all flex items-center gap-2 ${
                  selectedSizeForCombination && selectedColorForCombination
                    ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Combination
              </button>
              {selectedSizeForCombination && selectedColorForCombination && (
                <p className="mt-2 text-sm text-gray-600">
                  Ready to add: <span className="font-medium">{selectedSizeForCombination}</span> / <span className="font-medium">{selectedColorForCombination}</span>
                  <span className="ml-2 text-xs text-gray-500">(Click + to add, or change selection to add different combinations)</span>
                </p>
              )}
            </div>

            {/* Quick Add: Multiple sizes for selected color */}
            {selectedColorForCombination && !selectedSizeForCombination && (
              <div className="pt-2 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Or: Add multiple sizes for <span className="font-semibold text-red-600">{selectedColorForCombination}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {normalizedSizes.map((size: string, index: number) => (
                    <button
                      key={`quick-size-${size}-${index}`}
                      type="button"
                      onClick={() => addVariant(size, selectedColorForCombination)}
                      className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50 font-medium transition-all"
                    >
                      {size} <span className="text-xs text-gray-500">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add: Multiple colors for selected size */}
            {selectedSizeForCombination && !selectedColorForCombination && (
              <div className="pt-2 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Or: Add multiple colors for <span className="font-semibold text-red-600">{selectedSizeForCombination}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {normalizedColors.map((color: string, index: number) => (
                    <button
                      key={`quick-color-${color}-${index}`}
                      type="button"
                      onClick={() => addVariant(selectedSizeForCombination, color)}
                      className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50 font-medium transition-all"
                    >
                      {color} <span className="text-xs text-gray-500">+</span>
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
                    {!selection.size && !selection.color && (
                      <span className="text-gray-500 italic">No variants</span>
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
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors rounded"
                    aria-label="Remove variant"
                    title="Remove this combination"
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

