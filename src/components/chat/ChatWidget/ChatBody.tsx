"use client";
import * as React from 'react';
import { ChatSession, ChatLanguage, QuickAction } from '../types';

interface ChatBodyProps {
  session?: ChatSession;
  currentLanguage: ChatLanguage;
  quickActions: QuickAction[];
  onQuickAction: (action: QuickAction) => void;
  isConnecting: boolean;
}

export default function ChatBody({
  session,
  currentLanguage,
  quickActions,
  onQuickAction,
  isConnecting
}: ChatBodyProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const getWelcomeMessage = () => {
    if (currentLanguage === 'bn') {
      return {
        greeting: 'আসসালামু আলাইকুম! 👋',
        message: 'Scarlet এ আপনাকে স্বাগতম। আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
        subMessage: 'নিচের বিকল্পগুলি থেকে বেছে নিন অথবা আপনার প্রশ্ন লিখুন:'
      };
    }
    return {
      greeting: 'Hello! 👋',
      message: 'Welcome to Scarlet. How can I help you today?',
      subMessage: 'Choose from the options below or type your question:'
    };
  };

  const welcomeMsg = getWelcomeMessage();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        <div className="flex justify-center">
          <div className="max-w-xs text-center">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-lg mb-2">{welcomeMsg.greeting}</div>
              <div className="text-sm text-gray-700 mb-2">{welcomeMsg.message}</div>
              <div className="text-xs text-gray-500">{welcomeMsg.subMessage}</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {session?.messages && session.messages.length > 0 && (
          <div className="space-y-3">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl text-sm
                    ${message.sender === 'user'
                      ? 'bg-red-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }
                  `}
                >
                  <div className="break-words">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-red-100' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {(!session?.messages || session.messages.length === 0) && !isConnecting && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 text-center font-medium">
              {currentLanguage === 'bn' ? 'দ্রুত সহায়তা:' : 'Quick Help:'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onQuickAction(action)}
                  className="p-3 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-red-800">
                      {action.label[currentLanguage]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isConnecting && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md p-4 border border-gray-100">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {currentLanguage === 'bn' ? 'টাইপ করছে...' : 'Typing...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Business Hours Notice */}
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
        <div className="flex items-center gap-2 text-xs text-yellow-700">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>
            {currentLanguage === 'bn' 
              ? 'আমরা সকাল ৯টা থেকে রাত ১০টা পর্যন্ত উপলব্ধ আছি'
              : 'We\'re available 9 AM - 10 PM (Bangladesh time)'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
