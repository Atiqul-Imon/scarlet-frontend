import { fetchJson } from './api';
import type { 
  ChatConversation, 
  ChatMessage, 
  ChatNotification, 
  ChatUser 
} from './chat-types';

export const chatApi = {
  // Conversation management
  async startConversation(customerId: string, customerInfo: any): Promise<ChatConversation> {
    return fetchJson('/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, customerInfo })
    });
  },

  async getConversationByCustomer(customerId: string): Promise<ChatConversation | null> {
    return fetchJson(`/chat/conversations/customer/${customerId}`);
  },

  async getActiveConversations(): Promise<ChatConversation[]> {
    console.log('Chat API: Getting active conversations...');
    try {
      // Use fetchJsonAuth for admin endpoints to include authentication token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const result = await fetchJson('/chat/admin/conversations', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      console.log('Chat API: Got conversations:', result);
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

  // Message management
  async sendMessage(conversationId: string, senderId: string, senderType: 'customer' | 'admin', content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    return fetchJson('/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, senderId, senderType, content, messageType })
    });
  },

  async getConversationMessages(conversationId: string, limit: number = 50, skip: number = 0): Promise<ChatMessage[]> {
    return fetchJson(`/chat/conversations/${conversationId}/messages?limit=${limit}&skip=${skip}`);
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    return fetchJson(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  },

  // User management
  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    return fetchJson(`/chat/users/${userId}/online-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    return fetchJson(`/chat/users/${userId}/unread-count/${userType}`);
  },

  // Notifications
  async getNotifications(userId: string, userType: 'customer' | 'admin'): Promise<ChatNotification[]> {
    return fetchJson(`/chat/users/${userId}/notifications/${userType}`);
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return fetchJson(`/chat/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }
};
