"use client";
import * as React from 'react';
import { ChatChannel, ChatLanguage } from '../types';

interface ChatInputProps {
  channel: ChatChannel;
  language: ChatLanguage;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  channel,
  language,
  onSendMessage,
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setIsTyping(value.length > 0);
    
    // Auto-resize textarea with fixed minimum height
    if (inputRef.current) {
      inputRef.current.style.height = '56px'; // Reset to fixed height
      const newHeight = Math.min(Math.max(inputRef.current.scrollHeight, 56), 120);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  const getPlaceholder = () => {
    if (disabled) {
      return language === 'bn' ? 'সংযোগ করা হচ্ছে...' : 'Connecting...';
    }
    
    switch (channel) {
      case 'whatsapp':
        return language === 'bn' 
          ? 'WhatsApp এ বার্তা লিখুন...' 
          : 'Type a message for WhatsApp...';
      case 'messenger':
        return language === 'bn' 
          ? 'Messenger এ বার্তা লিখুন...' 
          : 'Type a message for Messenger...';
      default:
        return language === 'bn' ? 'বার্তা লিখুন...' : 'Type a message...';
    }
  };

  const getChannelAction = () => {
    switch (channel) {
      case 'whatsapp':
        return {
          text: language === 'bn' ? 'WhatsApp এ পাঠান' : 'Send to WhatsApp',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
            </svg>
          ),
          color: 'bg-green-500 hover:bg-green-600'
        };
      case 'messenger':
        return {
          text: language === 'bn' ? 'Messenger এ পাঠান' : 'Send to Messenger',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.616 4.47 8.652V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z"/>
            </svg>
          ),
          color: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          text: language === 'bn' ? 'পাঠান' : 'Send',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
          color: 'bg-pink-500 hover:bg-pink-600'
        };
    }
  };

  const channelAction = getChannelAction();

  return (
    <div className="border-t border-gray-200 bg-white p-5">
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled}
            rows={2}
            className={`
              w-full resize-none border-2 border-gray-200 rounded-2xl px-5 py-4 pr-12
              focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 focus:bg-white
              text-base font-semibold text-gray-900 placeholder-gray-400 transition-all duration-200
              ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white hover:border-gray-300 hover:bg-gray-50'}
              max-h-[120px] overflow-y-auto leading-relaxed h-14 selection:bg-pink-200
            `}
          />
          
          {/* Character count for long messages */}
          {message.length > 100 && (
            <div className="absolute bottom-2 right-4 text-xs text-gray-400 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm border border-gray-100">
              {message.length}/1000
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`
            w-14 h-14 rounded-2xl text-white font-semibold
            transition-all duration-200 flex items-center justify-center
            ${disabled || !message.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : `${channelAction.color} transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`
            }
          `}
          aria-label={channelAction.text}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Quick Actions Row */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{language === 'bn' ? 'Enter দিয়ে পাঠান' : 'Press Enter to send'}</span>
          {isTyping && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              <span>{language === 'bn' ? 'টাইপ করছেন...' : 'Typing...'}</span>
            </div>
          )}
        </div>
        
        {/* Powered by indicator */}
        <div className="flex items-center gap-1 text-gray-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Scarlet</span>
        </div>
      </div>
    </div>
  );
}
