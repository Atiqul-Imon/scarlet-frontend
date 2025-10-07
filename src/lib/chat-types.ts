export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  isOnline: boolean;
  lastSeen: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'admin';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  read: boolean;
  readAt?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

export interface ChatConversation {
  _id: string;
  customerId: string;
  adminId?: string;
  status: 'active' | 'closed' | 'waiting';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
    currentPage?: string;
    userAgent?: string;
  };
}

export interface ChatNotification {
  _id: string;
  userId: string;
  userType: 'customer' | 'admin';
  conversationId: string;
  messageId: string;
  type: 'new_message' | 'typing' | 'conversation_started' | 'conversation_closed';
  title: string;
  content: string;
  read: boolean;
  timestamp: string;
}

export interface ChatTyping {
  conversationId: string;
  userId: string;
  userType: 'customer' | 'admin';
  isTyping: boolean;
  timestamp: string;
}

export interface ChatSocketEvents {
  // Client to Server
  authenticate: (data: { userId: string; userType: 'customer' | 'admin' }) => void;
  join_conversation: (data: { conversationId: string }) => void;
  send_message: (data: { conversationId: string; content: string; messageType?: 'text' | 'image' | 'file' }) => void;
  typing_start: (data: { conversationId: string }) => void;
  typing_stop: (data: { conversationId: string }) => void;
  assign_conversation: (data: { conversationId: string; adminId: string }) => void;
  
  // Server to Client
  authenticated: (data: { success: boolean }) => void;
  auth_error: (data: { message: string }) => void;
  joined_conversation: (data: { conversationId: string }) => void;
  new_message: (message: ChatMessage) => void;
  user_typing: (data: { userId: string; userType: 'customer' | 'admin'; isTyping: boolean }) => void;
  customer_message: (data: { conversationId: string; message: ChatMessage; customerId: string }) => void;
  admin_joined: (data: { conversationId: string; adminId: string }) => void;
  conversation_assigned: (conversation: ChatConversation) => void;
  user_offline: (data: { userId: string; userType: 'customer' | 'admin' }) => void;
  error: (data: { message: string }) => void;
}

export interface ChatState {
  isConnected: boolean;
  isAuthenticated: boolean;
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  conversations: ChatConversation[];
  notifications: ChatNotification[];
  onlineUsers: ChatUser[];
  typingUsers: ChatTyping[];
  unreadCount: number;
}
