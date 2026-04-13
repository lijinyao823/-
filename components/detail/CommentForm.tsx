'use client';

import React from 'react';
import { Send, CornerDownRight } from 'lucide-react';

interface Props {
  replyTo: { id: string; author: string } | null;
  onClearReply: () => void;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  currentUser: any;
}

export default function CommentForm({ replyTo, onClearReply, value, onChange, onSubmit, loading, currentUser }: Props) {
  return (
    <form onSubmit={onSubmit} className="mb-10">
      {replyTo && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
          <CornerDownRight size={12} />
          回复 @{replyTo.author}
          <button type="button" onClick={onClearReply} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}
      <div className="flex gap-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={currentUser ? (replyTo ? `回复 @${replyTo.author}...` : '分享你的见解...') : '登录后参与评论'}
          disabled={!currentUser}
          className="flex-1 bg-gray-50 border-none rounded-xl px-6 py-3 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !currentUser}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
