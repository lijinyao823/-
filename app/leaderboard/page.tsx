'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PhotoRankList from '@/components/leaderboard/PhotoRankList';
import PhotographerRankList from '@/components/leaderboard/PhotographerRankList';

type Period = 'all' | 'week' | 'month';

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('month');
  const [topPhotos, setTopPhotos] = useState<any[]>([]);
  const [topPhotographers, setTopPhotographers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      let photoQuery = supabase.from('photos').select('id, title, image_url, url, author_name, user_id, likes_count, created_at').order('likes_count', { ascending: false }).limit(10);
      if (period === 'week') photoQuery = photoQuery.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      else if (period === 'month') photoQuery = photoQuery.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      const { data: photosData } = await photoQuery;
      setTopPhotos(photosData || []);

      let allPhotosQuery = supabase.from('photos').select('user_id, author_name, likes_count, created_at');
      if (period === 'week') allPhotosQuery = allPhotosQuery.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      else if (period === 'month') allPhotosQuery = allPhotosQuery.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      const { data: allPhotos } = await allPhotosQuery;

      const photographerMap: Record<string, { name: string; totalLikes: number; count: number }> = {};
      (allPhotos || []).forEach((p: any) => {
        if (!p.user_id) return;
        if (!photographerMap[p.user_id]) photographerMap[p.user_id] = { name: p.author_name || '匿名', totalLikes: 0, count: 0 };
        photographerMap[p.user_id].totalLikes += p.likes_count || 0;
        photographerMap[p.user_id].count += 1;
      });

      const sorted = Object.entries(photographerMap).map(([uid, info]) => ({ user_id: uid, ...info })).sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 10);
      setTopPhotographers(sorted);
    } finally {
      setLoading(false);
    }
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">排行榜</h1>
          <p className="text-gray-500 mt-2">发现最受欢迎的摄影作品与摄影师</p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          {([
            { id: 'week', label: '本周' },
            { id: 'month', label: '本月' },
            { id: 'all', label: '所有时间' },
          ] as { id: Period; label: string }[]).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${period === p.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={36} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PhotoRankList photos={topPhotos} medals={medals} />
            <PhotographerRankList photographers={topPhotographers} medals={medals} />
          </div>
        )}
      </div>
    </div>
  );
}
