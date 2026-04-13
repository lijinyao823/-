'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
  otherUser: any;
  onBack: () => void;
}

export default function ConversationHeader({ otherUser, onBack }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-16 z-10">
      <button onClick={onBack} className="p-1 text-gray-400 hover:text-blue-600">
        <ArrowLeft size={20} />
      </button>
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
        {otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          (otherUser?.username || '?')[0]
        )}
      </div>
      <span className="font-bold text-gray-900">{otherUser?.username || '摄影师'}</span>
    </div>
  );
}
