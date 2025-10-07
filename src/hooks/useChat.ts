'use client';

import { useChat as useChatContext } from '@/lib/chat-context';

export function useChat() {
  return useChatContext();
}

export function useChatWidget(userId?: string, userType: 'customer' | 'admin' = 'customer') {
  const chat = useChatContext();
  
  const connect = () => {
    if (userId) {
      chat.connect(userId, userType);
    }
  };

  const disconnect = () => {
    chat.disconnect();
  };

  return {
    ...chat,
    connect,
    disconnect
  };
}
