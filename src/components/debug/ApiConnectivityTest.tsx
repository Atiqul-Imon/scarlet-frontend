"use client";
import React, { useState } from 'react';
import { categoryApi } from '../../lib/api';

export default function ApiConnectivityTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      console.log('🧪 Testing API connectivity...');
      const categories = await categoryApi.getCategories();
      setTestResult(`✅ API Connection Successful! Found ${categories.length} categories.`);
      console.log('✅ API test successful:', categories);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ API Connection Failed: ${errorMessage}`);
      console.error('❌ API test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    setTestResult('Testing direct fetch...');
    
    try {
      const response = await fetch('/api/proxy/catalog/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult(`✅ Direct Fetch Successful! Found ${data.data?.length || 0} categories.`);
      console.log('✅ Direct fetch successful:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Direct Fetch Failed: ${errorMessage}`);
      console.error('❌ Direct fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Connectivity Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isLoading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>
      
      <div className="p-3 bg-white rounded border">
        <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
      </div>
    </div>
  );
}
