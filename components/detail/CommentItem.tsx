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
  // 提取头像地址，兼容联表查询后的嵌套结构
  const avatarUrl = comment.user_profiles?.avatar_url;
  const displayName = comment.user_profiles?.username || comment.author;

  return (
    <div className="flex gap-4">
      {/* 头像区域：优先显示图片，无图片则显示首字母 */}
      <div className={`${
        isReply ? 'w-8 h-8' : 'w-10 h-10'
      } rounded-full overflow-hidden bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 border border-gray-100`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // 防止图片加载失败导致空白，如果加载失败则显示文字占位
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="uppercase">{displayName[0]}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          {/* 名字优先显示 profiles 里的最新昵称 */}
          <span className="font-bold text-sm text-gray-900">
            {displayName}
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{formatTime(comment.created_at)}</span>
            
            {/* 回复按钮 */}
            {currentUserId && (
              <button 
                onClick={() => onReply(comment.id, displayName)} 
                className="text-[10px] text-gray-400 hover:text-blue-600 transition-colors"
              >
                回复
              </button>
            )}
            
            {/* 删除按钮：仅限评论所有者 */}
            {currentUserId === comment.user_id && (
              <button 
                onClick={() => onDelete(comment.id)} 
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
        
        {/* 评论内容 */}
        <p className="text-gray-600 text-sm break-all">{comment.content}</p>
      </div>
    </div>
  );
}