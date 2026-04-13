'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Grid, Trash2, Heart, Loader2, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AlbumManager from '@/components/profile/AlbumManager';

export default function UserWorksGrid() {
  const [activeTab, setActiveTab] = useState<'works' | 'likes' | 'albums'>('works');
  const [works, setWorks] = useState<any[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const loadData = useCallback(async (user: any) => {
    setLoading(true);
    try {
      const { data: myWorks } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setWorks(myWorks || []);

      const { data: likesData } = await supabase
        .from('likes')
        .select('photo_id')
        .eq('user_id', user.id);
      if (likesData && likesData.length > 0) {
        const photoIds = likesData.map((l: any) => l.photo_id);
        const { data: likedData } = await supabase
          .from('photos')
          .select('*')
          .in('id', photoIds);
        setLikedPhotos(likedData || []);
      } else {
        setLikedPhotos([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) loadData(user);
    });
  }, [loadData]);

  const handleDelete = async (photo: any) => {
    if (!confirm(`确定删除"${photo.title}"吗？此操作不可撤销。`)) return;

    if (photo.image_url) {
      try {
        const urlParts = photo.image_url.split('/');
        const storagePathIndex = urlParts.findIndex((p: string) => p === 'gallery');
        if (storagePathIndex !== -1) {
          const storagePath = urlParts.slice(storagePathIndex + 1).join('/');
          await supabase.storage.from('gallery').remove([storagePath]);
        }
      } catch {
        // ignore storage delete errors
      }
    }

    await supabase.from('photos').delete().eq('id', photo.id).eq('user_id', currentUser.id);
    setWorks(prev => prev.filter(w => w.id !== photo.id));
  };

  const displayPhotos = activeTab === 'works' ? works : likedPhotos;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100">
        {[
          { id: 'works', label: `我的作品 (${works.length})` },
          { id: 'likes', label: `赞过的 (${likedPhotos.length})` },
          { id: 'albums', label: '相册' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.id === 'albums' && <FolderOpen size={14} />}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Albums tab */}
      {activeTab === 'albums' ? (
        <AlbumManager userId={currentUser?.id} userPhotos={works} />
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-gray-400" size={28} />
            </div>
          ) : displayPhotos.length === 0 ? (
            <p className="text-center text-gray-400 italic py-12">
              {activeTab === 'works' ? '还没有发布任何作品，快去上传吧！' : '还没有点赞任何作品'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-gray-100"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={photo.image_url || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => router.push(`/photo/${photo.id}`)}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
                      >
                        <Grid size={18} />
                      </button>
                      {activeTab === 'works' && (
                        <button
                          onClick={() => handleDelete(photo)}
                          className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{photo.title}</h4>
                      <p className="text-[10px] text-gray-400">
                        {photo.created_at ? new Date(photo.created_at).toLocaleDateString('zh-CN') : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Heart size={12} className="fill-current" />
                      <span className="text-xs font-bold">{photo.likes_count || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
