import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageSquare, UserPlus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

interface Props {
  userId: string;
  onClose: () => void;
  onRead: () => void;
}

export default function NotificationDropdown({ userId, onClose, onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  // 标记全部已读
  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onRead();
  };

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const iconMap = {
    like: <Heart size={14} className="text-red-500" />,
    comment: <MessageSquare size={14} className="text-blue-500" />,
    follow: <UserPlus size={14} className="text-green-500" />,
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-[200] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h4 className="font-bold text-gray-900 text-sm">通知</h4>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-[10px] text-blue-600 hover:underline">全部已读</button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">加载中...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">暂无通知</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">{n.actor_name}</span>
                  {n.type === 'like' && ` 赞了你的作品「${n.photo_title || ''}」`}
                  {n.type === 'comment' && ` 评论了你的作品「${n.photo_title || ''}」`}
                  {n.type === 'follow' && ' 关注了你'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(n.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
