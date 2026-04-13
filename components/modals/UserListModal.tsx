'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  title: string;
  users: any[];
  onClose: () => void;
}

export default function UserListModal({ title, users, onClose }: Props) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">暂无数据</p>
          ) : users.map((u: any) => (
            <button
              key={u.user_id}
              onClick={() => { router.push(`/user/${u.user_id}`); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  (u.username || '?')[0]
                )}
              </div>
              <span className="text-sm font-bold text-gray-800">@{u.username || '摄影师'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
