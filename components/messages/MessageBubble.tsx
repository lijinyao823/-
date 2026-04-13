'use client';

import React from 'react';

interface Props {
  message: any;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: Props) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
        <p>{message.content}</p>
        <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
