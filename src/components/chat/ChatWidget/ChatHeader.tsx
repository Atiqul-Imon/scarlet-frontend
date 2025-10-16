"use client";
import * as React from 'react';
import { ChatChannel, ChatLanguage } from '../types';

interface ChatHeaderProps {
  channel: ChatChannel;
  language: ChatLanguage;
  isConnecting: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onLanguageChange: (language: ChatLanguage) => void;
  onShowChannelSelector: () => void;
}

export default function ChatHeader({
  channel,
  language,
  isConnecting,
  isMinimized,
  onClose,
  onMinimize,
  onLanguageChange,
  onShowChannelSelector
}: ChatHeaderProps) {
  const getChannelInfo = (channel: ChatChannel) => {
    switch (channel) {
      case 'whatsapp':
        return {
          name: 'WhatsApp',
          color: 'bg-green-500',
          icon: (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
            </svg>
          )
        };
      case 'messenger':
        return {
          name: 'Messenger',
          color: 'bg-blue-500',
          icon: (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.616 4.47 8.652V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z"/>
            </svg>
          )
        };
      default:
        return {
          name: 'Chat',
          color: 'bg-red-500',
          icon: (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          )
        };
    }
  };

  const channelInfo = getChannelInfo(channel);

  const getStatusText = () => {
    if (isConnecting) {
      return language === 'bn' ? 'সংযোগ করা হচ্ছে...' : 'Connecting...';
    }
    return language === 'bn' ? 'অনলাইন • সাধারণত ২ মিনিটে উত্তর দেয়' : 'Online • Usually replies in 2 minutes';
  };

  return (
    <div className={`${channelInfo.color} text-white p-4 flex items-center justify-between`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Channel Icon & Status */}
        <div className="relative">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {channelInfo.icon}
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        {/* Channel Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">
              Scarlet {channelInfo.name}
            </h3>
            
            {/* Channel switcher button */}
            <button
              onClick={onShowChannelSelector}
              className="text-white text-opacity-80 hover:text-opacity-100 transition-opacity"
              aria-label="Switch channel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          
          <p className="text-xs text-white text-opacity-80 truncate">
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        {/* Language Switcher */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
          className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center justify-center text-xs font-medium"
          aria-label="Switch language"
        >
          {language === 'en' ? 'বাং' : 'EN'}
        </button>

        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center justify-center"
          aria-label={isMinimized ? 'Expand' : 'Minimize'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMinimized ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center justify-center"
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
