'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AchievementsPanel from '@/components/profile/AchievementsPanel';
import FollowListPanel from '@/components/profile/FollowListPanel';

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
  { icon: '🔰', title: '光影新星', color: 'bg-green-100 text-green-600', check: (p) => p >= 1 },
  { icon: '📸', title: '光影达人', color: 'bg-blue-100 text-blue-600', check: (p) => p >= 10 },
  { icon: '❤️', title: '人气摄影师', color: 'bg-pink-100 text-pink-600', check: (_p, l) => l >= 50 },
  { icon: '🌟', title: '校园明星', color: 'bg-purple-100 text-purple-600', check: (_p, l) => l >= 200 },
  { icon: '👥', title: '社交达人', color: 'bg-indigo-100 text-indigo-600', check: (_p, _l, f) => f >= 20 },
  { icon: '🏆', title: '年度十佳', color: 'bg-yellow-100 text-yellow-600', check: (_p, l) => l >= 500 },
];

export default function ProfileSidebar() {
  const [followings, setFollowings] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', user.id).limit(8);
      if (followData && followData.length > 0) {
        const ids = followData.map((f: any) => f.following_id);
        const { data: profiles } = await supabase.from('user_profiles').select('user_id, username').in('user_id', ids);
        setFollowings(profiles || []);
      }

      const { data: followerData } = await supabase.from('follows').select('follower_id').eq('following_id', user.id).limit(8);
      if (followerData && followerData.length > 0) {
        const ids = followerData.map((f: any) => f.follower_id);
        const { data: profiles } = await supabase.from('user_profiles').select('user_id, username').in('user_id', ids);
        setFollowers(profiles || []);
      }

      const { data: photos } = await supabase.from('photos').select('likes_count').eq('user_id', user.id);
      const photoCount = photos?.length ?? 0;
      const totalLikes = (photos ?? []).reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
      const { count: followerCount } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id);

      const unlocked = ACHIEVEMENT_RULES
        .filter(r => r.check(photoCount, totalLikes, followerCount ?? 0))
        .map(({ icon, title, color }) => ({ icon, title, color }));
      setAchievements(unlocked);
    }
    load();
  }, []);

  return (
    <div className="lg:col-span-1 space-y-8">
      <AchievementsPanel achievements={achievements} />
      <FollowListPanel followings={followings} followers={followers} />
    </div>
  );
}
