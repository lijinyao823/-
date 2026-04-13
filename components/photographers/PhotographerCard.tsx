'use client';

import React from 'react';
import { Camera, Heart, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface Photographer {
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  college?: string;
  grade?: string;
  worksCount: number;
  totalLikes: number;
  followerCount: number;
}

interface Props {
  photographer: Photographer;
  isFollowing: boolean;
  isSelf: boolean;
  togglingId: string | null;
  onFollow: (e: React.MouseEvent, targetId: string) => void;
  onClick: () => void;
}

export default function PhotographerCard({ photographer: p, isFollowing, isSelf, togglingId, onFollow, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
          ) : (
            (p.username || '?')[0]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{p.username || '摄影师'}</h3>
          {(p.college || p.grade) && (
            <p className="text-xs text-gray-400 mt-0.5">{[p.college, p.grade].filter(Boolean).join(' · ')}</p>
          )}
          {p.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.bio}</p>}
        </div>
      </div>

      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Camera size={13} className="text-blue-400" />
          <span className="text-xs font-bold">{p.worksCount}</span>
          <span className="text-xs text-gray-400">作品</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Heart size={13} className="text-red-400" />
          <span className="text-xs font-bold">{p.totalLikes}</span>
          <span className="text-xs text-gray-400">获赞</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users size={13} className="text-indigo-400" />
          <span className="text-xs font-bold">{p.followerCount}</span>
          <span className="text-xs text-gray-400">粉丝</span>
        </div>
      </div>

      {!isSelf && (
        <button
          onClick={(e) => onFollow(e, p.user_id)}
          disabled={togglingId === p.user_id}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
        >
          {togglingId === p.user_id ? (
            <Loader2 className="animate-spin" size={14} />
          ) : isFollowing ? (
            <><UserCheck size={14} />已关注</>
          ) : (
            <><UserPlus size={14} />关注</>
          )}
        </button>
      )}
    </div>
  );
}
