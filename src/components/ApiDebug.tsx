'use client';

import { useState, useEffect } from 'react';
import { testMobileConnection } from '@/lib/api';

export default function ApiDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show debug panel on Ctrl+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Test API connection
      const connectionTest = await testMobileConnection();
      
      // Gather environment info
      const envInfo = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
        NODE_ENV: process.env.NODE_ENV,
        windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
        timestamp: new Date().toISOString()
      };

      // Test direct API call
      const apiBase = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

      let directApiTest = null;
      try {
        const response = await fetch(`${apiBase}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        directApiTest = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: `${apiBase}/health`
        };
      } catch (err) {
        directApiTest = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          url: `${apiBase}/health`
        };
      }

      setDebugInfo({
        connectionTest,
        envInfo,
        directApiTest,
        apiBase
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50">
        Press Ctrl+Shift+D for API Debug
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">API Connection Debug</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Diagnostics...' : 'Run API Diagnostics'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {debugInfo && (
              <div className="space-y-4">
                {/* Environment Variables */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Environment Variables</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>NEXT_PUBLIC_API_URL:</strong> {debugInfo.envInfo.NEXT_PUBLIC_API_URL || 'Not set'}</div>
                    <div><strong>NEXT_PUBLIC_API_BASE:</strong> {debugInfo.envInfo.NEXT_PUBLIC_API_BASE || 'Not set'}</div>
                    <div><strong>NODE_ENV:</strong> {debugInfo.envInfo.NODE_ENV}</div>
                    <div><strong>API Base URL:</strong> {debugInfo.apiBase}</div>
                  </div>
                </div>

                {/* Connection Test */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Mobile Connection Test</h3>
                  <div className={`text-sm ${debugInfo.connectionTest.success ? 'text-green-600' : 'text-red-600'}`}>
                    <div><strong>Status:</strong> {debugInfo.connectionTest.success ? '✅ Success' : '❌ Failed'}</div>
                    {debugInfo.connectionTest.data && (
                      <div><strong>Response:</strong> {JSON.stringify(debugInfo.connectionTest.data, null, 2)}</div>
                    )}
                    {debugInfo.connectionTest.error && (
                      <div><strong>Error:</strong> {debugInfo.connectionTest.error}</div>
                    )}
                  </div>
                </div>

                {/* Direct API Test */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Direct API Health Check</h3>
                  <div className={`text-sm ${debugInfo.directApiTest.success ? 'text-green-600' : 'text-red-600'}`}>
                    <div><strong>URL:</strong> {debugInfo.directApiTest.url}</div>
                    <div><strong>Status:</strong> {debugInfo.directApiTest.success ? '✅ Success' : '❌ Failed'}</div>
                    {debugInfo.directApiTest.status && (
                      <div><strong>HTTP Status:</strong> {debugInfo.directApiTest.status} {debugInfo.directApiTest.statusText}</div>
                    )}
                    {debugInfo.directApiTest.error && (
                      <div><strong>Error:</strong> {debugInfo.directApiTest.error}</div>
                    )}
                  </div>
                </div>

                {/* Device Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Device Information</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>User Agent:</strong> {debugInfo.envInfo.userAgent}</div>
                    <div><strong>Location:</strong> {debugInfo.envInfo.windowLocation}</div>
                    <div><strong>Timestamp:</strong> {debugInfo.envInfo.timestamp}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
