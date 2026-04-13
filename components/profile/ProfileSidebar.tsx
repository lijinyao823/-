'use client';

import React, { useEffect, useState } from 'react';
import { Award, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Achievement {
  icon: string;
  title: string;
  color: string;
}

const ACHIEVEMENT_RULES: Array<{
  icon: string;
  title: string;
  color: string;
  check: (photoCount: number, totalLikes: number, followerCount: number) => boolean;
}> = [
  {
    icon: '🔰',
    title: '光影新星',
    color: 'bg-green-100 text-green-600',
    check: (p) => p >= 1,
  },
  {
    icon: '📸',
    title: '光影达人',
    color: 'bg-blue-100 text-blue-600',
    check: (p) => p >= 10,
  },
  {
    icon: '❤️',
    title: '人气摄影师',
    color: 'bg-pink-100 text-pink-600',
    check: (_p, l) => l >= 50,
  },
  {
    icon: '🌟',
    title: '校园明星',
    color: 'bg-purple-100 text-purple-600',
    check: (_p, l) => l >= 200,
  },
  {
    icon: '👥',
    title: '社交达人',
    color: 'bg-indigo-100 text-indigo-600',
    check: (_p, _l, f) => f >= 20,
  },
  {
    icon: '🏆',
    title: '年度十佳',
    color: 'bg-yellow-100 text-yellow-600',
    check: (_p, l) => l >= 500,
  },
];

export default function ProfileSidebar() {
  const router = useRouter();
  const [followings, setFollowings] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeList, setActiveList] = useState<'following' | 'followers'>('following');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load followings
      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .limit(8);

      if (followData && followData.length > 0) {
        const ids = followData.map((f: any) => f.following_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', ids);
        setFollowings(profiles || []);
      }

      // Load followers
      const { data: followerData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id)
        .limit(8);

      if (followerData && followerData.length > 0) {
        const ids = followerData.map((f: any) => f.follower_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', ids);
        setFollowers(profiles || []);
      }

      // Compute real achievements
      const { data: photos } = await supabase
        .from('photos')
        .select('likes_count')
        .eq('user_id', user.id);

      const photoCount = photos?.length ?? 0;
      const totalLikes = (photos ?? []).reduce((s: number, p: any) => s + (p.likes_count || 0), 0);

      const { count: followerCount } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const unlocked = ACHIEVEMENT_RULES
        .filter(r => r.check(photoCount, totalLikes, followerCount ?? 0))
        .map(({ icon, title, color }) => ({ icon, title, color }));

      setAchievements(unlocked);
    }
    load();
  }, []);

  const displayList = activeList === 'following' ? followings : followers;

  return (
    <div className="lg:col-span-1 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={18} className="text-yellow-500" />
          <span>荣誉成就</span>
        </h3>
        {achievements.length === 0 ? (
          <p className="text-xs text-gray-400">上传你的第一张作品，开启荣誉之旅！</p>
        ) : (
          <div className="space-y-3">
            {achievements.map(item => (
              <div key={item.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
