"use client";
import * as React from 'react';
import { ChatChannel } from '../types';

interface ChannelSelectorProps {
  currentChannel: ChatChannel;
  onChannelSelect: (channel: ChatChannel) => void;
  onClose: () => void;
}

export default function ChannelSelector({
  currentChannel,
  onChannelSelect,
  onClose
}: ChannelSelectorProps) {
  const channels = [
    {
      id: 'whatsapp' as ChatChannel,
      name: 'WhatsApp',
      description: 'Chat via WhatsApp Business',
      descriptionBn: 'WhatsApp Business এর মাধ্যমে চ্যাট করুন',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      features: ['Instant notifications', 'Rich media support', 'Popular in Bangladesh'],
      featuresBn: ['তাৎক্ষণিক বিজ্ঞপ্তি', 'রিচ মিডিয়া সাপোর্ট', 'বাংলাদেশে জনপ্রিয়']
    },
    {
      id: 'messenger' as ChatChannel,
      name: 'Messenger',
      description: 'Chat via Facebook Messenger',
      descriptionBn: 'Facebook Messenger এর মাধ্যমে চ্যাট করুন',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.616 4.47 8.652V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z"/>
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      features: ['Facebook integration', 'Chat history sync', 'Rich interactions'],
      featuresBn: ['Facebook ইন্টিগ্রেশন', 'চ্যাট ইতিহাস সিঙ্ক', 'রিচ ইন্টারঅ্যাকশন']
    }
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Choose Chat Platform</h3>
              <p className="text-sm text-gray-500 mt-1">Select your preferred way to chat with us</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Channel Options */}
        <div className="p-6 space-y-4">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                ${currentChannel === channel.id
                  ? `${channel.borderColor} ${channel.bgColor} ring-2 ring-opacity-20 ${channel.color.replace('text-', 'ring-')}`
                  : `border-gray-200 ${channel.hoverColor} hover:border-gray-300`
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${channel.color} ${channel.bgColor} p-3 rounded-xl`}>
                  {channel.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{channel.name}</h4>
                    {currentChannel === channel.id && (
                      <div className={`w-2 h-2 ${channel.color.replace('text-', 'bg-')} rounded-full`}></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-1">
                    {channel.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Your preference will be saved for future chats</span>
          </div>
        </div>
      </div>
    </div>
  );
}
