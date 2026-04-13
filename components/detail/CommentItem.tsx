'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return date.toLocaleDateString('zh-CN');
}

interface Props {
  comment: any;
  currentUserId?: any;
  onReply: (id: string, author: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, currentUserId, onReply, onDelete, isReply = false }: Props) {
  return (
    <div className="flex gap-4">
      <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0`}>
        {comment.author[0]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm text-gray-900">{comment.author}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{formatTime(comment.created_at)}</span>
            {currentUserId && (
              <button onClick={() => onReply(comment.id, comment.author)} className="text-[10px] text-gray-400 hover:text-blue-600">
                回复
              </button>
            )}
            {currentUserId === comment.user_id && (
              <button onClick={() => onDelete(comment.id)} className="text-[10px] text-gray-400 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
