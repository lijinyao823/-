'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Heart, Camera, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

type Period = 'all' | 'week' | 'month';

export default function Leaderboard() {
  const router = useRouter();
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
      let photoQuery = supabase
        .from('photos')
        .select('id, title, image_url, url, author_name, user_id, likes_count, created_at')
        .order('likes_count', { ascending: false })
        .limit(10);

      if (period === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        photoQuery = photoQuery.gte('created_at', weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        photoQuery = photoQuery.gte('created_at', monthAgo);
      }

      const { data: photosData } = await photoQuery;
      setTopPhotos(photosData || []);

      // Photographers: apply the same period filter
      let allPhotosQuery = supabase
        .from('photos')
        .select('user_id, author_name, likes_count, created_at');

      if (period === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        allPhotosQuery = allPhotosQuery.gte('created_at', weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        allPhotosQuery = allPhotosQuery.gte('created_at', monthAgo);
      }

      const { data: allPhotos } = await allPhotosQuery;

      const photographerMap: Record<string, { name: string; totalLikes: number; count: number }> = {};
      (allPhotos || []).forEach((p: any) => {
        if (!p.user_id) return;
        if (!photographerMap[p.user_id]) {
          photographerMap[p.user_id] = { name: p.author_name || '匿名', totalLikes: 0, count: 0 };
        }
        photographerMap[p.user_id].totalLikes += p.likes_count || 0;
        photographerMap[p.user_id].count += 1;
      });

      const sorted = Object.entries(photographerMap)
        .map(([uid, info]) => ({ user_id: uid, ...info }))
        .sort((a, b) => b.totalLikes - a.totalLikes)
        .slice(0, 10);
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
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                作品排行 TOP 10
              </h2>
              <div className="space-y-3">
                {topPhotos.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
                ) : topPhotos.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/photo/${p.id}`)}
                    className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={p.image_url || p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.author_name || '匿名'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
                      <Heart size={14} className="fill-current" />
                      <span className="text-sm font-bold">{p.likes_count || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                摄影师排行 TOP 10
              </h2>
              <div className="space-y-3">
                {topPhotographers.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
                ) : topPhotographers.map((p, i) => (
                  <motion.div
                    key={p.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/user/${p.user_id}`)}
                    className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.count} 件作品</p>
                    </div>
                    <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
                      <Heart size={14} className="fill-current" />
                      <span className="text-sm font-bold">{p.totalLikes}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
