
'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { useAuth } from '@/lib/context';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatWidgetProps {
  userId?: string;
  userType?: 'customer' | 'admin';
  userInfo?: {
    name: string;
    email?: string;
    phone?: string;
    currentPage?: string;
  };
}

export default function ChatWidget({ 
  userId, 
  userType = 'customer', 
  userInfo 
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { user, isAuthenticated: isUserAuthenticated } = useAuth();
  const {
    isConnected,
    isAuthenticated,
    currentConversation,
    messages,
    unreadCount,
    connect,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat();

  // Get user information from authenticated user (or fallback for when not authenticated)
  const currentUserId = userId || user?._id || '';
  const currentUserType = userType || (user?.role === 'admin' ? 'admin' : 'customer');
  const currentUserInfo = userInfo || {
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User',
    email: user?.email,
    phone: user?.phone,
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '/'
  };

  // Track if connection has been initiated
  const connectionInitiated = React.useRef(false);

  // Auto-connect when component mounts (only for authenticated users)
  useEffect(() => {
    if (isUserAuthenticated && user && currentUserId && currentUserType && !isConnected && !connectionInitiated.current) {
      connectionInitiated.current = true;
      // Use a timeout to prevent immediate re-calls
      const timeoutId = setTimeout(() => {
        connect(currentUserId, currentUserType);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    return undefined; // Explicit return for all code paths
  }, [isUserAuthenticated, user]); // Only depend on auth state

  // Start conversation when widget opens
  useEffect(() => {
    if (isOpen && isAuthenticated && currentUserType === 'customer' && !currentConversation) {
      startConversation();
    }
  }, [isOpen, isAuthenticated, currentUserType, currentConversation]);

  const startConversation = async () => {
    if (currentUserId && currentUserInfo) {
      try {
        const { chatApi } = await import('@/lib/chat-api');
        const conversation = await chatApi.startConversation(currentUserId, {
          ...currentUserInfo,
          currentPage: window.location.pathname,
          userAgent: navigator.userAgent
        });
        
        if (conversation) {
          joinConversation(conversation._id);
        }
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setMessage('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value && !isTyping) {
      setIsTyping(true);
      startTyping();
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const toggleWidget = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Only show chat widget for authenticated users (no anonymous chat)
  if (!isUserAuthenticated || !user) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          title="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-96'
    }`}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-full flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">
              {currentUserType === 'admin' ? 'Admin Chat' : 'Customer Support'}
            </span>
            {!isConnected && (
              <span className="text-xs bg-yellow-500 px-2 py-1 rounded">Connecting...</span>
            )}
            {isConnected && !isAuthenticated && (
              <span className="text-xs bg-orange-500 px-2 py-1 rounded">Authenticating...</span>
            )}
            {isConnected && isAuthenticated && (
              <span className="text-xs bg-green-500 px-2 py-1 rounded">Online</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={closeWidget}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {currentUserType === 'admin' 
                      ? 'No messages yet. Wait for customer messages.' 
                      : 'Start a conversation with our support team!'
                    }
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderType === currentUserType ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.senderType === currentUserType
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderType === currentUserType ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder={!isConnected ? "Connecting..." : "Type your message..."}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || !isConnected}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
              {!isConnected && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Connecting to chat server...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
