'use client';

import React from 'react';
import { UserPlus, UserCheck, MessageSquare } from 'lucide-react';

interface Stats {
  works: number;
  likes: number;
  followers: number;
  following: number;
}

interface Props {
  profile: any;
  stats: Stats;
  isFollowing: boolean;
  isSelf: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onShowModal: (type: 'followers' | 'following') => void;
}

export default function UserProfileCard({ profile, stats, isFollowing, isSelf, onFollow, onMessage, onShowModal }: Props) {
  const displayName = profile?.username || '摄影师';
  const bio = profile?.bio || '这位摄影师还没有填写个人简介';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 -mt-16 relative">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-lg">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName[0]
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          {profile?.college && (
            <p className="text-sm text-gray-500">{profile.college} · {profile.grade}</p>
          )}
          <p className="text-sm text-gray-600 mt-2 max-w-lg">{bio}</p>
        </div>
        {!isSelf && (
          <div className="flex items-center gap-2">
            <button
              onClick={onMessage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            >
              <MessageSquare size={16} />
              发私信
            </button>
            <button
              onClick={onFollow}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
            >
              {isFollowing ? <><UserCheck size={16} />已关注</> : <><UserPlus size={16} />关注</>}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
        {[
          { label: '作品', value: stats.works, onClick: undefined },
          { label: '获赞', value: stats.likes, onClick: undefined },
          { label: '粉丝', value: stats.followers, onClick: () => onShowModal('followers') },
          { label: '关注', value: stats.following, onClick: () => onShowModal('following') },
        ].map(s => (
          <div
            key={s.label}
            className={`text-center ${s.onClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
            onClick={s.onClick}
          >
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
