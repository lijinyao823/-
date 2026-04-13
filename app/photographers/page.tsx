'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Camera, Heart, Users, UserPlus, UserCheck } from 'lucide-react';

type SortKey = 'likes' | 'followers' | 'works' | 'newest';

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
  createdAt?: string;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'likes', label: '获赞最多' },
  { key: 'followers', label: '粉丝最多' },
  { key: 'works', label: '作品最多' },
  { key: 'newest', label: '最新加入' },
];

export default function PhotographersPage() {
  const router = useRouter();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('likes');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .then(({ data }) => {
            if (data) setFollowingIds(new Set(data.map((f: any) => f.following_id)));
          });
      }
    });
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, username, bio, avatar_url, college, grade, created_at');

      if (!profiles || profiles.length === 0) { setPhotographers([]); return; }

      const enriched: Photographer[] = await Promise.all(
        profiles.map(async (p: any) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('likes_count')
            .eq('user_id', p.user_id);
          const worksCount = photos?.length ?? 0;
          const totalLikes = (photos ?? []).reduce((s: number, ph: any) => s + (ph.likes_count || 0), 0);

          const { count: followerCount } = await supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', p.user_id);

          return {
            user_id: p.user_id,
            username: p.username,
            bio: p.bio,
            avatar_url: p.avatar_url,
            college: p.college,
            grade: p.grade,
            worksCount,
            totalLikes,
            followerCount: followerCount ?? 0,
            createdAt: p.created_at,
          };
        })
      );

      setPhotographers(enriched);
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...photographers].sort((a, b) => {
    switch (sortKey) {
      case 'likes': return b.totalLikes - a.totalLikes;
      case 'followers': return b.followerCount - a.followerCount;
      case 'works': return b.worksCount - a.worksCount;
      case 'newest': return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      default: return 0;
    }
  });

  const handleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUser) { router.push('/login'); return; }
    if (currentUser.id === targetId || togglingId) return;

    setTogglingId(targetId);
    try {
      if (followingIds.has(targetId)) {
        await supabase.from('follows').delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetId);
        setFollowingIds(prev => { const s = new Set(prev); s.delete(targetId); return s; });
        setPhotographers(prev => prev.map(p => p.user_id === targetId ? { ...p, followerCount: p.followerCount - 1 } : p));
      } else {
        await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: targetId }]);
        setFollowingIds(prev => new Set([...prev, targetId]));
        setPhotographers(prev => prev.map(p => p.user_id === targetId ? { ...p, followerCount: p.followerCount + 1 } : p));
        try {
          await supabase.from('notifications').insert([{
            user_id: targetId,
            type: 'follow',
            actor_name: currentUser.email?.split('@')[0] || '某用户',
          }]);
        } catch {}
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Camera size={28} className="text-blue-600" />
            摄影师
          </h1>
          <p className="text-gray-500">发现校园里的优秀摄影师</p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${sortKey === opt.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={36} />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center py-20 text-gray-400">暂无摄影师数据</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(p => {
              const isFollowing = followingIds.has(p.user_id);
              const isSelf = currentUser?.id === p.user_id;
              return (
                <div
                  key={p.user_id}
                  onClick={() => router.push(`/user/${p.user_id}`)}
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
                      {p.bio && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.bio}</p>
                      )}
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
                      onClick={(e) => handleFollow(e, p.user_id)}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
