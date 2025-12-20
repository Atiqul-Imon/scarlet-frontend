// Chat system configuration for Bangladesh market
import { ChatConfig } from '../types';

export const chatConfig: ChatConfig = {
  whatsapp: {
    phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    businessName: 'Scarlet Beauty Store',
    welcomeMessage: {
      en: 'Hello! 👋 Welcome to Scarlet. How can I help you with your beauty needs today?',
      bn: 'আসসালামু আলাইকুম! 👋 Scarlet এ আপনাকে স্বাগতম। আজ আপনার সৌন্দর্য প্রয়োজনে আমি কীভাবে সাহায্য করতে পারি?'
    }
  },
  messenger: {
    pageId: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || process.env.NEXT_PUBLIC_META_PAGE_ID || 'your-facebook-page-id',
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || 'your-facebook-app-id',
    pageName: 'Scarlet Beauty Store',
    themeColor: '#E91E63', // Pink theme to match brand
    loggedInGreeting: {
      en: 'Hi {{user_first_name}}! 👋 Welcome to Scarlet. How can I help you with your beauty needs today?',
      bn: 'হ্যালো {{user_first_name}}! 👋 Scarlet এ আপনাকে স্বাগতম। আজ আপনার সৌন্দর্য প্রয়োজনে আমি কীভাবে সাহায্য করতে পারি?'
    },
    loggedOutGreeting: {
      en: 'Hi there! 👋 Welcome to Scarlet on Messenger. What can I help you find today?',
      bn: 'হ্যালো! 👋 Messenger এ Scarlet এ আপনাকে স্বাগতম। আজ আমি আপনাকে কী খুঁজে পেতে সাহায্য করতে পারি?'
    },
    welcomeMessage: {
      en: 'Hi there! 👋 Welcome to Scarlet on Messenger. What can I help you find today?',
      bn: 'হ্যালো! 👋 Messenger এ Scarlet এ আপনাকে স্বাগতম। আজ আমি আপনাকে কী খুঁজে পেতে সাহায্য করতে পারি?'
    }
  },
  businessHours: {
    start: '09:00',
    end: '22:00',
    timezone: 'Asia/Dhaka',
    workingDays: [0, 1, 2, 3, 4, 5, 6] // All days of the week
  },
  autoResponses: {
    enabled: true,
    responseDelay: 2000, // 2 seconds
    outOfHours: {
      en: 'Thanks for contacting Scarlet! Our team is currently offline (9 AM - 10 PM, Bangladesh time). We\'ll get back to you as soon as possible. 🌙',
      bn: 'Scarlet এ যোগাযোগের জন্য ধন্যবাদ! আমাদের টিম বর্তমানে অফলাইন (সকাল ৯টা - রাত ১০টা, বাংলাদেশ সময়)। আমরা যত তাড়াতাড়ি সম্ভব আপনার কাছে ফিরে আসব। 🌙'
    }
  }
};

// Messenger message templates for common queries
export const messengerTemplates = {
  productInquiry: {
    en: 'Hi! I\'m interested in learning more about {product_name}. Can you provide details about pricing, ingredients, and availability? 💄',
    bn: 'হ্যালো! আমি {product_name} সম্পর্কে আরও জানতে আগ্রহী। আপনি কি দাম, উপাদান এবং প্রাপ্যতা সম্পর্কে বিস্তারিত তথ্য দিতে পারেন? 💄'
  },
  orderStatus: {
    en: 'Hello! I would like to check the status of my order. My order number is {order_id}. 📦',
    bn: 'হ্যালো! আমি আমার অর্ডারের স্ট্যাটাস চেক করতে চাই। আমার অর্ডার নম্বর হলো {order_id}। 📦'
  },
  deliveryInfo: {
    en: 'Hi! I need information about delivery options and charges for Dhaka/Bangladesh. How long does shipping usually take? 🚚',
    bn: 'হ্যালো! আমার ঢাকা/বাংলাদেশের জন্য ডেলিভারি অপশন এবং চার্জ সম্পর্কে তথ্য দরকার। সাধারণত শিপিং কতক্ষণ সময় নেয়? 🚚'
  },
  returnPolicy: {
    en: 'Hello! I would like to know about your return and exchange policy. What are the conditions and timeframe? 🔄',
    bn: 'হ্যালো! আমি আপনার রিটার্ন এবং এক্সচেঞ্জ পলিসি সম্পর্কে জানতে চাই। শর্তাবলী এবং সময়সীমা কী? 🔄'
  },
  generalSupport: {
    en: 'Hi! I need help with my Scarlet account/order. Can someone assist me please? 🙋‍♀️',
    bn: 'হ্যালো! আমার Scarlet অ্যাকাউন্ট/অর্ডার নিয়ে সাহায্য দরকার। কেউ কি আমাকে সাহায্য করতে পারেন? 🙋‍♀️'
  },
  beautyConsultation: {
    en: 'Hi! I would like a beauty consultation. Can you help me choose the right products for my skin type? ✨',
    bn: 'হ্যালো! আমি একটি সৌন্দর্য পরামর্শ চাই। আপনি কি আমার ত্বকের ধরনের জন্য সঠিক পণ্য বেছে নিতে সাহায্য করতে পারেন? ✨'
  }
};

// WhatsApp message templates for common queries
export const whatsappTemplates = {
  productInquiry: {
    en: 'Hi! I\'m interested in learning more about {product_name}. Can you provide details about pricing, ingredients, and availability?',
    bn: 'হ্যালো! আমি {product_name} সম্পর্কে আরও জানতে আগ্রহী। আপনি কি দাম, উপাদান এবং প্রাপ্যতা সম্পর্কে বিস্তারিত তথ্য দিতে পারেন?'
  },
  orderStatus: {
    en: 'Hello! I would like to check the status of my order. My order number is {order_id}.',
    bn: 'হ্যালো! আমি আমার অর্ডারের স্ট্যাটাস চেক করতে চাই। আমার অর্ডার নম্বর হলো {order_id}।'
  },
  deliveryInfo: {
    en: 'Hi! I need information about delivery options and charges for Dhaka/Bangladesh. How long does shipping usually take?',
    bn: 'হ্যালো! আমার ঢাকা/বাংলাদেশের জন্য ডেলিভারি অপশন এবং চার্জ সম্পর্কে তথ্য দরকার। সাধারণত শিপিং কতক্ষণ সময় নেয়?'
  },
  returnPolicy: {
    en: 'Hello! I would like to know about your return and exchange policy. What are the conditions and timeframe?',
    bn: 'হ্যালো! আমি আপনার রিটার্ন এবং এক্সচেঞ্জ পলিসি সম্পর্কে জানতে চাই। শর্তাবলী এবং সময়সীমা কী?'
  },
  generalSupport: {
    en: 'Hi! I need help with my Scarlet account/order. Can someone assist me please?',
    bn: 'হ্যালো! আমার Scarlet অ্যাকাউন্ট/অর্ডার নিয়ে সাহায্য দরকার। কেউ কি আমাকে সাহায্য করতে পারেন?'
  }
};

// Business hours checker
export const isBusinessHours = (): boolean => {
  const now = new Date();
  const dhaka = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dhaka"}));
  const currentHour = dhaka.getHours();
  const currentDay = dhaka.getDay();
  
  const startHour = parseInt(chatConfig.businessHours.start.split(':')[0]);
  const endHour = parseInt(chatConfig.businessHours.end.split(':')[0]);
  
  return chatConfig.businessHours.workingDays.includes(currentDay) && 
         currentHour >= startHour && 
         currentHour < endHour;
};

// Format phone number for WhatsApp
export const formatWhatsAppNumber = (number: string): string => {
  return number.replace(/[^\d]/g, '');
};
