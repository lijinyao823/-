'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserItem {
  user_id: string;
  username?: string;
}

interface Props {
  followings: UserItem[];
  followers: UserItem[];
}

export default function FollowListPanel({ followings, followers }: Props) {
  const router = useRouter();
  const [activeList, setActiveList] = React.useState<'following' | 'followers'>('following');
  const displayList = activeList === 'following' ? followings : followers;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex gap-4 mb-4 border-b border-gray-100">
        <button
          onClick={() => setActiveList('following')}
          className={`pb-2 text-sm font-bold transition-colors ${activeList === 'following' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={14} className="inline mr-1" />
          我的关注
        </button>
        <button
          onClick={() => setActiveList('followers')}
          className={`pb-2 text-sm font-bold transition-colors ${activeList === 'followers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          我的粉丝
        </button>
      </div>
      {displayList.length === 0 ? (
        <p className="text-xs text-gray-400">
          {activeList === 'following'
            ? '还没有关注任何摄影师，去探索画廊发现你喜欢的作者吧！'
            : '还没有粉丝，快去分享你的作品吧！'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayList.map((f: any) => (
            <button
              key={f.user_id}
              onClick={() => router.push(`/user/${f.user_id}`)}
              className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
            >
              @{f.username || '摄影师'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
