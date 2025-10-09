'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { chatApi } from '@/lib/chat-api';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import type { ChatConversation } from '@/lib/chat-types';

interface AdminChatDashboardProps {
  adminId: string;
  adminName: string;
}

export default function AdminChatDashboard({ adminId, adminName }: AdminChatDashboardProps) {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localConversations, setLocalConversations] = useState<ChatConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const {
    isConnected,
    isAuthenticated,
    conversations,
    messages,
    onlineUsers,
    unreadCount,
    connect,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping,
    assignConversation,
    closeConversation,
    loadConversations
  } = useChat();

  // Auto-connect as admin
  useEffect(() => {
    if (adminId && !isConnected) {
      connect(adminId, 'admin');
    }
  }, [adminId, isConnected, connect]);

  // Load conversations directly from API (admin is already authenticated via admin panel)
  useEffect(() => {
    console.log('Admin Chat Debug:', {
      isAuthenticated,
      adminId,
      adminName,
      isConnected
    });
    
    // Load conversations immediately since admin is already authenticated via admin panel
    if (adminId) {
      console.log('Loading conversations for admin:', adminId);
      setIsLoadingConversations(true);
      
      chatApi.getActiveConversations()
        .then(convos => {
          console.log('Loaded conversations:', convos);
          setLocalConversations(convos);
        })
        .catch(error => {
          console.error('Failed to load conversations:', error);
        })
        .finally(() => {
          setIsLoadingConversations(false);
        });
    }
  }, [adminId]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    joinConversation(conversation._id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

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

  const handleAssignConversation = async (conversation: ChatConversation) => {
    try {
      await assignConversation(adminId);
    } catch (error) {
      console.error('Failed to assign conversation:', error);
    }
  };

  const handleCloseConversation = async () => {
    if (selectedConversation) {
      try {
        await closeConversation();
        setSelectedConversation(null);
      } catch (error) {
        console.error('Failed to close conversation:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Active Conversations</h2>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {conversations.length} conversations
            </span>
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {unreadCount} unread
            </span>
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 animate-pulse" />
              <p>Loading conversations...</p>
            </div>
          ) : localConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active conversations</p>
            </div>
          ) : (
            localConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{conversation.customerInfo.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(conversation.updatedAt).toLocaleTimeString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.customerInfo.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {selectedConversation.customerInfo.email && (
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {selectedConversation.customerInfo.email}
                        </span>
                      )}
                      {selectedConversation.customerInfo.phone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedConversation.customerInfo.phone}
                        </span>
                      )}
                      {selectedConversation.customerInfo.currentPage && (
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {selectedConversation.customerInfo.currentPage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </span>
                  {selectedConversation.status === 'waiting' && (
                    <button
                      onClick={() => handleAssignConversation(selectedConversation)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Take Over
                    </button>
                  )}
                  {selectedConversation.status === 'active' && (
                    <button
                      onClick={handleCloseConversation}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.senderType === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
