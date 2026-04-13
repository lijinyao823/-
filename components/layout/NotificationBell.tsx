'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

interface Props {
  userId: string;
  unreadCount: number;
  onCountChange: (count: number) => void;
}

export default function NotificationBell({ userId, unreadCount, onCountChange }: Props) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
        title="通知"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {show && (
        <NotificationDropdown
          userId={userId}
          onClose={() => setShow(false)}
          onRead={() => onCountChange(0)}
        />
      )}
    </div>
  );
}
