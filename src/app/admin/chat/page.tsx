'use client';

import React from 'react';
import AdminChatDashboard from '@/components/chat/AdminChatDashboard';
import { useAuth } from '@/lib/context';

export default function AdminChatPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <AdminChatDashboard 
          adminId={user._id} 
          adminName={user.name || 'Admin'} 
        />
      </div>
    </div>
  );
}
