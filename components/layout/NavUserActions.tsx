'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, LogOut, MessageSquare } from 'lucide-react';
import NotificationBell from '@/components/layout/NotificationBell';

interface Props {
  user: any;
  unreadCount: number;
  unreadMessages: number;
  onLogout: () => void;
  onUnreadCountChange: (count: number) => void;
}

export default function NavUserActions({ user, unreadCount, unreadMessages, onLogout, onUnreadCountChange }: Props) {
  const router = useRouter();
  return (
    <>
      <NotificationBell userId={user.id} unreadCount={unreadCount} onCountChange={onUnreadCountChange} />

      <Link href="/messages" className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative" title="私信">
        <MessageSquare size={20} />
        {unreadMessages > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </Link>

      <button
        className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
        onClick={() => router.push('/profile')}
      >
        <PlusCircle size={16} />
        <span>上传</span>
      </button>

      <div className="flex items-center gap-2 ml-2">
        <Link href="/profile" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
          <User size={22} />
        </Link>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="退出登录">
          <LogOut size={20} />
        </button>
      </div>
    </>
  );
}
