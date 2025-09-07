'use client';

import { useState } from 'react';
import { testMobileConnection } from '@/lib/api';

export default function MobileDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testMobileConnection();
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Connection test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold text-gray-900 mb-2">Mobile Debug</h3>
      
      <button
        onClick={handleTest}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 mb-3"
      >
        {isLoading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {result && (
        <div className="text-sm">
          <div className="text-green-600 font-medium mb-2">✅ Connection Successful</div>
          <div className="space-y-1 text-gray-600">
            <div><strong>Environment:</strong> {result.environment}</div>
            <div><strong>Origin:</strong> {result.origin || 'None'}</div>
            <div><strong>User Agent:</strong> {result.userAgent?.substring(0, 50)}...</div>
            <div><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm">
          <div className="text-red-600 font-medium mb-2">❌ Connection Failed</div>
          <div className="text-gray-600">{error}</div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
      </div>
    </div>
  );
}
