"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useServiceWorker, usePushNotifications } from '@/hooks/useServiceWorker';

interface ServiceWorkerContextType {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
  updateServiceWorker: () => Promise<void>;
  unregisterServiceWorker: () => Promise<void>;
  // Push notifications
  pushNotifications: {
    isSupported: boolean;
    permission: NotificationPermission;
    subscription: PushSubscription | null;
    requestPermission: () => Promise<boolean>;
    subscribeToPush: () => Promise<PushSubscription | null>;
    unsubscribeFromPush: () => Promise<boolean>;
  };
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | null>(null);

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const serviceWorker = useServiceWorker();
  const pushNotifications = usePushNotifications();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Listen for service worker updates
  useEffect(() => {
    if (!serviceWorker.registration) return;

    const handleUpdateFound = () => {
      const newWorker = serviceWorker.registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            setShowUpdateNotification(true);
          }
        });
      }
    };

    serviceWorker.registration.addEventListener('updatefound', handleUpdateFound);

    return () => {
      serviceWorker.registration?.removeEventListener('updatefound', handleUpdateFound);
    };
  }, [serviceWorker.registration]);

  const handleUpdate = async () => {
    await serviceWorker.updateServiceWorker();
    setShowUpdateNotification(false);
    window.location.reload();
  };

  const contextValue: ServiceWorkerContextType = {
    ...serviceWorker,
    pushNotifications,
  };

  return (
    <ServiceWorkerContext.Provider value={contextValue}>
      {children}
      
      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Update Available
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                A new version of the app is available. Would you like to update?
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowUpdateNotification(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ServiceWorkerContext.Provider>
  );
}

export function useServiceWorkerContext() {
  const context = useContext(ServiceWorkerContext);
  if (!context) {
    throw new Error('useServiceWorkerContext must be used within a ServiceWorkerProvider');
  }
  return context;
}
