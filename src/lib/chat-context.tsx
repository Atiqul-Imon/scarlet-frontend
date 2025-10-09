'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from './chat-api';
import type { 
  ChatState, 
  ChatMessage, 
  ChatConversation, 
  ChatNotification, 
  ChatUser,
  ChatTyping,
  ChatSocketEvents 
} from './chat-types';

interface ChatContextType extends ChatState {
  // Actions
  connect: (userId: string, userType: 'customer' | 'admin') => Promise<void>;
  disconnect: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: () => void;
  sendMessage: (content: string, messageType?: 'text' | 'image' | 'file') => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  assignConversation: (adminId: string) => Promise<void>;
  closeConversation: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_CONVERSATION'; payload: ChatConversation | null }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CONVERSATIONS'; payload: ChatConversation[] }
  | { type: 'SET_NOTIFICATIONS'; payload: ChatNotification[] }
  | { type: 'SET_ONLINE_USERS'; payload: ChatUser[] }
  | { type: 'SET_TYPING_USERS'; payload: ChatTyping[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'UPDATE_MESSAGE_READ'; payload: { conversationId: string; messageId: string } }
  | { type: 'ADD_TYPING_USER'; payload: ChatTyping }
  | { type: 'REMOVE_TYPING_USER'; payload: string };

const initialState: ChatState = {
  isConnected: false,
  isAuthenticated: false,
  currentConversation: null,
  messages: [],
  conversations: [],
  notifications: [],
  onlineUsers: [],
  typingUsers: [],
  unreadCount: 0
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_CONVERSATION':
      return { ...state, currentConversation: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        currentConversation: state.currentConversation ? {
          ...state.currentConversation,
          lastMessage: action.payload,
          unreadCount: action.payload.senderType === 'customer' ? 
            state.currentConversation.unreadCount + 1 : 
            state.currentConversation.unreadCount
        } : null
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'UPDATE_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload.messageId
            ? { ...msg, read: true, readAt: new Date().toISOString() }
            : msg
        )
      };
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: [
          ...state.typingUsers.filter(t => t.userId !== action.payload.userId),
          action.payload
        ]
      };
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(t => t.userId !== action.payload)
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [socket, setSocket] = React.useState<Socket<ChatSocketEvents> | null>(null);
  const [currentUser, setCurrentUser] = React.useState<{ userId: string; userType: 'customer' | 'admin' } | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const connectionAttempted = React.useRef(false);
  
  // Use refs to access current state values without causing re-renders
  const stateRef = React.useRef(state);
  stateRef.current = state;
  
  const currentUserRef = React.useRef(currentUser);
  currentUserRef.current = currentUser;

  const connect = useCallback(async (userId: string, userType: 'customer' | 'admin') => {
    // Prevent multiple connection attempts
    if (connectionAttempted.current) {
      console.log('Connection already attempted, skipping');
      return;
    }
    
    if (socket && socket.connected) {
      console.log('Socket already connected, skipping connection attempt');
      return;
    }
    
    if (isConnecting) {
      console.log('Connection already in progress, skipping');
      return;
    }
    
    connectionAttempted.current = true;
    setIsConnecting(true);
    
    try {
      const socketUrl = process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:4000';
      console.log('Attempting to connect to:', socketUrl);
      
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        dispatch({ type: 'SET_CONNECTED', payload: true });
        
        // Authenticate with the server
        newSocket.emit('authenticate', { userId, userType });
      });

      newSocket.on('authenticated', () => {
        console.log('Socket authenticated');
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        setCurrentUser({ userId, userType });
        
        // Update online status
        chatApi.updateUserOnlineStatus(userId, true);
      });

      newSocket.on('auth_error', (data) => {
        console.error('Socket authentication error:', data.message);
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      });

      newSocket.on('new_message', (message) => {
        console.log('New message received:', message);
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });

      newSocket.on('user_typing', (data) => {
        if (data.isTyping) {
          dispatch({ 
            type: 'ADD_TYPING_USER', 
            payload: {
              conversationId: '', // Will be set when user joins conversation
              userId: data.userId,
              userType: data.userType,
              isTyping: true,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId });
        }
      });

      newSocket.on('admin_joined', (data) => {
        console.log('Admin joined conversation:', data);
        // Update conversation status
        const currentConversation = stateRef.current.currentConversation;
        if (currentConversation && currentConversation._id === data.conversationId) {
          const updatedConversation: ChatConversation = {
            _id: currentConversation._id,
            customerId: currentConversation.customerId,
            adminId: data.adminId,
            status: 'active',
            priority: currentConversation.priority,
            tags: currentConversation.tags,
            createdAt: currentConversation.createdAt,
            updatedAt: currentConversation.updatedAt,
            unreadCount: currentConversation.unreadCount,
            customerInfo: currentConversation.customerInfo,
            ...(currentConversation.subject && { subject: currentConversation.subject }),
            ...(currentConversation.lastMessage && { lastMessage: currentConversation.lastMessage })
          };
          dispatch({ 
            type: 'SET_CONVERSATION', 
            payload: updatedConversation
          });
        }
      });

      newSocket.on('user_online', (data) => {
        console.log('User came online:', data);
        // Add to online users if not already present
        const currentOnlineUsers = stateRef.current.onlineUsers;
        if (!currentOnlineUsers.find(u => u._id === data.userId)) {
          dispatch({ 
            type: 'SET_ONLINE_USERS', 
            payload: [...currentOnlineUsers, data] 
          });
        }
      });

      newSocket.on('user_offline', (data) => {
        console.log('User went offline:', data);
        // Remove from online users
        const currentOnlineUsers = stateRef.current.onlineUsers;
        dispatch({ 
          type: 'SET_ONLINE_USERS', 
          payload: currentOnlineUsers.filter(u => u._id !== data.userId) 
        });
      });

      newSocket.on('error', (data) => {
        console.error('Socket error:', data.message);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to connect to chat server:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []); // Remove all dependencies to prevent infinite loop

  const disconnect = useCallback(() => {
    if (socket) {
      const user = currentUserRef.current;
      if (user) {
        chatApi.updateUserOnlineStatus(user.userId, false);
      }
      socket.disconnect();
      setSocket(null);
      setCurrentUser(null);
      dispatch({ type: 'SET_CONNECTED', payload: false });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      connectionAttempted.current = false; // Reset connection attempt flag
    }
  }, [socket]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && stateRef.current.isAuthenticated) {
      socket.emit('join_conversation', { conversationId });
      // Load messages directly to avoid circular dependency
      chatApi.getConversationMessages(conversationId)
        .then(messages => {
          dispatch({ type: 'SET_MESSAGES', payload: messages });
          // Mark messages as read - use currentUser from ref
          const user = currentUserRef.current;
          if (user) {
            chatApi.markMessagesAsRead(conversationId, user.userId)
              .catch(error => console.error('Failed to mark messages as read:', error));
          }
        })
        .catch(error => console.error('Failed to load messages:', error));
    }
  }, [socket]);

  const leaveConversation = useCallback(() => {
    dispatch({ type: 'SET_CONVERSATION', payload: null });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
  }, []);

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (!socket) return;
    
    const user = currentUserRef.current;
    if (!user) return;

    try {
      let conversation = stateRef.current.currentConversation;
      
      // If no conversation exists for customers, start one
      if (!conversation && user.userType === 'customer') {
        const customerInfo = {
          name: user.userId.includes('temp_') ? 'Anonymous Customer' : 'Customer',
          currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
        };
        
        conversation = await chatApi.startConversation(user.userId, customerInfo);
        if (conversation) {
          dispatch({ type: 'SET_CONVERSATION', payload: conversation });
          socket.emit('join_conversation', { conversationId: conversation._id });
        }
      }
      
      if (conversation) {
        await chatApi.sendMessage(
          conversation._id,
          user.userId,
          user.userType,
          content,
          messageType
        );
        
        // The message will be added via socket event
        socket.emit('send_message', {
          conversationId: conversation._id,
          content,
          messageType
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [socket]);

  const startTyping = useCallback(() => {
    if (socket && stateRef.current.currentConversation) {
      socket.emit('typing_start', { conversationId: stateRef.current.currentConversation._id });
    }
  }, [socket]);

  const stopTyping = useCallback(() => {
    if (socket && stateRef.current.currentConversation) {
      socket.emit('typing_stop', { conversationId: stateRef.current.currentConversation._id });
    }
  }, [socket]);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    const user = currentUserRef.current;
    if (user) {
      try {
        await chatApi.markMessagesAsRead(conversationId, user.userId);
        // Update local state
        dispatch({ type: 'UPDATE_MESSAGE_READ', payload: { conversationId, messageId: '' } });
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  }, []);

  const assignConversation = useCallback(async (adminId: string) => {
    if (socket && stateRef.current.currentConversation) {
      try {
        await chatApi.assignConversationToAdmin(stateRef.current.currentConversation._id, adminId);
        socket.emit('assign_conversation', {
          conversationId: stateRef.current.currentConversation._id,
          adminId
        });
      } catch (error) {
        console.error('Failed to assign conversation:', error);
      }
    }
  }, [socket]);

  const closeConversation = useCallback(async () => {
    if (socket && stateRef.current.currentConversation) {
      const user = currentUserRef.current;
      if (user) {
        try {
          await chatApi.closeConversation(stateRef.current.currentConversation._id, user.userId);
          dispatch({ type: 'SET_CONVERSATION', payload: null });
        } catch (error) {
          console.error('Failed to close conversation:', error);
        }
      }
    }
  }, [socket]);

  const loadConversations = useCallback(async () => {
    try {
      const conversations = await chatApi.getActiveConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);


  const loadNotifications = useCallback(async () => {
    const user = currentUserRef.current;
    if (user) {
      try {
        const notifications = await chatApi.getNotifications(user.userId, user.userType);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await chatApi.markNotificationAsRead(notificationId);
      dispatch({ 
        type: 'SET_NOTIFICATIONS', 
        payload: stateRef.current.notifications.filter(n => n._id !== notificationId) 
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Load initial data when authenticated
  useEffect(() => {
    if (state.isAuthenticated && currentUser) {
      // Load conversations directly to avoid function dependencies
      chatApi.getActiveConversations()
        .then(conversations => dispatch({ type: 'SET_CONVERSATIONS', payload: conversations }))
        .catch(error => console.error('Failed to load conversations:', error));
      
      // Load notifications directly
      chatApi.getNotifications(currentUser.userId, currentUser.userType)
        .then(notifications => dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications }))
        .catch(error => console.error('Failed to load notifications:', error));
      
      // Load unread count
      chatApi.getUnreadCount(currentUser.userId, currentUser.userType)
        .then(result => dispatch({ type: 'SET_UNREAD_COUNT', payload: result.count }))
        .catch(error => console.error('Failed to load unread count:', error));
    }
  }, [state.isAuthenticated, currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const user = currentUserRef.current;
      if (user) {
        chatApi.updateUserOnlineStatus(user.userId, false);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Remove currentUser dependency

  const contextValue: ChatContextType = {
    ...state,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    assignConversation,
    closeConversation,
    loadConversations,
    loadNotifications,
    markNotificationAsRead
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
