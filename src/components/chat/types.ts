// Chat system types
export type ChatChannel = 'whatsapp' | 'messenger';
export type ChatLanguage = 'en' | 'bn';
export type ChatStatus = 'online' | 'offline' | 'away';
export type MessageType = 'text' | 'image' | 'product' | 'order';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sender: 'user' | 'agent' | 'bot';
  channel: ChatChannel;
  language: ChatLanguage;
  metadata?: {
    productId?: string;
    orderId?: string;
    imageUrl?: string;
  };
}

export interface ChatSession {
  id: string;
  userId?: string;
  channel: ChatChannel;
  language: ChatLanguage;
  status: ChatStatus;
  messages: ChatMessage[];
  startTime: Date;
  lastActivity: Date;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface QuickAction {
  id: string;
  label: {
    en: string;
    bn: string;
  };
  message: {
    en: string;
    bn: string;
  };
  icon: string;
  category: 'product' | 'order' | 'support' | 'general';
}

export interface ChatConfig {
  whatsapp: {
    phoneNumber: string;
    businessName: string;
    welcomeMessage: {
      en: string;
      bn: string;
    };
  };
  messenger: {
    pageId: string;
    appId: string;
    pageName: string;
    themeColor: string;
    loggedInGreeting: {
      en: string;
      bn: string;
    };
    loggedOutGreeting: {
      en: string;
      bn: string;
    };
    welcomeMessage: {
      en: string;
      bn: string;
    };
  };
  businessHours: {
    start: string; // HH:mm format
    end: string;
    timezone: string;
    workingDays: number[]; // 0-6, Sunday is 0
  };
  autoResponses: {
    enabled: boolean;
    responseDelay: number; // milliseconds
    outOfHours: {
      en: string;
      bn: string;
    };
  };
}
