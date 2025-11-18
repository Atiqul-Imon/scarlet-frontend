"use client";
import * as React from 'react';

interface VariantStockManagerProps {
  sizes: string[];
  colors: string[];
  variantStock: Record<string, string>; // Values as strings for form inputs
  onChange: (variantStock: Record<string, string>) => void;
}

/**
 * Helper function to generate variant key from size and color
 */
function getVariantKey(size: string, color: string): string {
  const sizeKey = size || 'no-size';
  const colorKey = color || 'no-color';
  return `${sizeKey}_${colorKey}`;
}

export default function VariantStockManager({
  sizes,
  colors,
  variantStock,
  onChange
}: VariantStockManagerProps) {
  // Generate all possible combinations
  const combinations = React.useMemo(() => {
    const combos: Array<{ size: string; color: string; key: string }> = [];
    
    // If no sizes and no colors, create one "no-size_no-color" combination
    if (sizes.length === 0 && colors.length === 0) {
      combos.push({ size: '', color: '', key: getVariantKey('', '') });
    }
    // If only sizes
    else if (sizes.length > 0 && colors.length === 0) {
      sizes.forEach(size => {
        combos.push({ size, color: '', key: getVariantKey(size, '') });
      });
    }
    // If only colors
    else if (sizes.length === 0 && colors.length > 0) {
      colors.forEach(color => {
        combos.push({ size: '', color, key: getVariantKey('', color) });
      });
    }
    // If both sizes and colors
    else {
      sizes.forEach(size => {
        colors.forEach(color => {
          combos.push({ size, color, key: getVariantKey(size, color) });
        });
      });
    }
    
    return combos;
  }, [sizes, colors]);

  const handleStockChange = (key: string, value: string) => {
    const newVariantStock = { ...variantStock };
    // Only allow non-negative numbers
    const numValue = parseInt(value, 10);
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      newVariantStock[key] = value;
      onChange(newVariantStock);
    }
  };

  // Calculate total stock
  const totalStock = React.useMemo(() => {
    return Object.values(variantStock).reduce((sum, val) => {
      const num = parseInt(val, 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [variantStock]);

  if (combinations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Variant Stock Management</h3>
        <div className="text-sm text-gray-600">
          Total Stock: <span className="font-semibold text-gray-900">{totalStock}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid gap-4">
          {combinations.map((combo) => {
            const key = combo.key;
            const currentStock = variantStock[key] || '';
            const displaySize = combo.size || 'No Size';
            const displayColor = combo.color || 'No Color';
            
            return (
              <div key={key} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {displaySize} × {displayColor}
                  </div>
                  <div className="text-xs text-gray-500">{key}</div>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => handleStockChange(key, e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Set stock quantity for each size and color combination. Products without variants will use the main stock field.
      </p>
    </div>
  );
}

