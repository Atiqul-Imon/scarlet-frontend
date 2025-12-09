import { fetchJson, fetchJsonAuth } from './api';
import logger from './logger';
import type { 
  ChatConversation, 
  ChatMessage, 
  ChatNotification, 
  ChatUser 
} from './chat-types';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const chatApi = {
  // Conversation management (requires authentication)
  async startConversation(customerId: string, customerInfo: any): Promise<ChatConversation> {
    const token = getAuthToken();
    return fetchJson('/chat/conversations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ customerId, customerInfo })
    });
  },

  async getConversationByCustomer(customerId: string): Promise<ChatConversation | null> {
    const token = getAuthToken();
    return fetchJson(`/chat/conversations/customer/${customerId}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  async getActiveConversations(): Promise<ChatConversation[]> {
    logger.info('Chat API: Getting user conversations...');
    try {
      // Use the user-specific endpoint instead of admin endpoint
      const result = await fetchJsonAuth<ChatConversation[]>('/chat/conversations');
      logger.info('Chat API: Got conversations', { count: result.length });
      return result;
    } catch (error) {
      console.error('Chat API: Failed to get conversations:', error);
      throw error;
    }
  },

  async assignConversationToAdmin(conversationId: string, adminId: string): Promise<ChatConversation> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return fetchJson(`/chat/admin/conversations/${conversationId}/assign`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ adminId })
    });
  },

  async closeConversation(conversationId: string, adminId: string): Promise<ChatConversation> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return fetchJson(`/chat/admin/conversations/${conversationId}/close`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ adminId })
    });
  },

  // Message management (requires authentication)
  async sendMessage(conversationId: string, senderId: string, senderType: 'customer' | 'admin', content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    const token = getAuthToken();
    return fetchJson('/chat/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ conversationId, senderId, senderType, content, messageType })
    });
  },

  async getConversationMessages(conversationId: string, limit: number = 50, skip: number = 0): Promise<ChatMessage[]> {
    const token = getAuthToken();
    return fetchJson(`/chat/conversations/${conversationId}/messages?limit=${limit}&skip=${skip}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const token = getAuthToken();
    return fetchJson(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ userId })
    });
  },

  // User management (requires authentication)
  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const token = getAuthToken();
    return fetchJson(`/chat/users/${userId}/online-status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ isOnline })
    });
  },

  async getOnlineUsers(): Promise<ChatUser[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return fetchJson('/chat/admin/users/online', {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  async getUnreadCount(userId: string, userType: 'customer' | 'admin'): Promise<{ count: number }> {
    const token = getAuthToken();
    return fetchJson(`/chat/users/${userId}/unread-count/${userType}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  // Notifications (requires authentication)
  async getNotifications(userId: string, userType: 'customer' | 'admin'): Promise<ChatNotification[]> {
    const token = getAuthToken();
    return fetchJson(`/chat/users/${userId}/notifications/${userType}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const token = getAuthToken();
    return fetchJson(`/chat/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  }
};
