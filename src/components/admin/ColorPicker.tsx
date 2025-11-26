'use client';

import { useState, useEffect } from 'react';
import { SwatchIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Gray', value: '#F5F5F5' },
  { name: 'Cream', value: '#FFF8E7' },
  { name: 'Light Pink', value: '#FFF0F5' },
  { name: 'Soft Blue', value: '#F0F8FF' },
];

export default function ColorPicker({
  value,
  onChange,
  label = 'Background Color',
  presets = DEFAULT_PRESETS.map(p => p.value),
}: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(value || '#FFFFFF');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHexValue(value || '#FFFFFF');
  }, [value]);

  const validateHex = (hex: string): boolean => {
    const hexRegex = /^#?[0-9A-Fa-f]{6}$/;
    return hexRegex.test(hex);
  };

  const formatHex = (hex: string): string => {
    // Remove # if present
    let cleaned = hex.replace('#', '');
    // Add # if not present and valid length
    if (cleaned.length === 6) {
      return `#${cleaned.toUpperCase()}`;
    }
    return hex;
  };

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex);
    setError(null);

    // Format the hex value
    const formatted = formatHex(newHex);
    
    if (validateHex(formatted)) {
      onChange(formatted);
    } else if (newHex.length === 0) {
      // Allow empty while typing
      setError(null);
    } else {
      setError('Invalid hex color format. Use #RRGGBB');
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHexValue(newColor);
    onChange(newColor);
    setError(null);
  };

  const handlePresetClick = (preset: string) => {
    setHexValue(preset);
    onChange(preset);
    setError(null);
  };

  const handleReset = () => {
    const defaultColor = '#FFFFFF';
    setHexValue(defaultColor);
    onChange(defaultColor);
    setError(null);
  };

  const presetLabels = DEFAULT_PRESETS.filter(p => presets.includes(p.value));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          title="Reset to default (White)"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Current Color Display */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Current:</span>
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: hexValue }}
            title={hexValue}
          />
          <span className="text-sm font-mono text-gray-700">{hexValue}</span>
        </div>
      </div>

      {/* Preset Colors */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Preset Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {presetLabels.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all
                ${hexValue === preset.value
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
              title={preset.name}
            >
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-xs text-gray-700">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker and Hex Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Color Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Color Picker
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={hexValue}
              onChange={handleColorInputChange}
              className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#FFFFFF"
                className={`
                  w-full px-3 py-2 border rounded-lg font-mono text-sm
                  focus:ring-2 focus:ring-red-500 focus:border-transparent
                  ${error ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Box */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Preview
          </label>
          <div
            className="w-full h-24 rounded-lg border-2 border-gray-300 shadow-sm flex items-center justify-center"
            style={{ backgroundColor: hexValue }}
          >
            <span
              className="text-sm font-medium px-3 py-1 rounded"
              style={{
                color: hexValue === '#FFFFFF' || hexValue === '#F0F8FF' || hexValue === '#FFF8E7' || hexValue === '#FFF0F5' 
                  ? '#000000' 
                  : '#FFFFFF',
                backgroundColor: hexValue === '#FFFFFF' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
              }}
            >
              Sample Text
            </span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <SwatchIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            This color will be applied as the website background. Choose a light color to ensure text readability.
          </p>
        </div>
      </div>
    </div>
  );
}

