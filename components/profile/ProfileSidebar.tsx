'use client';

import React, { useEffect, useState } from 'react';
import { Award, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfileSidebar() {
  const router = useRouter();
  const [followings, setFollowings] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    }
    load();
  }, []);

  const achievements = [
    { icon: '🏆', title: '年度十佳摄影师', color: 'bg-yellow-100 text-yellow-600' },
    { icon: '📸', title: '光影达人', color: 'bg-blue-100 text-blue-600' },
  ];

  return (
    <div className="lg:col-span-1 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={18} className="text-yellow-500" />
          <span>荣誉成就</span>
        </h3>
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
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <span>我的关注</span>
        </h3>
        {followings.length === 0 ? (
          <p className="text-xs text-gray-400">还没有关注任何摄影师，去探索画廊发现你喜欢的作者吧！</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {followings.map(f => (
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
