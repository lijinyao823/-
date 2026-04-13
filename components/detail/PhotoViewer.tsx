'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PhotoViewer({ photo }: { photo: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(photo.likes_count ?? photo.likes ?? 0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        supabase
          .from('likes')
          .select('id')
          .eq('photo_id', photo.id)
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => setIsLiked(!!data));
      }
    });
  }, [photo.id]);

  const handleLike = async () => {
    if (!currentUser) { alert('请先登录后再点赞'); return; }
    if (liking) return;
    setLiking(true);

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('photo_id', photo.id).eq('user_id', currentUser.id);
        setLikesCount((n: number) => Math.max(0, n - 1));
        setIsLiked(false);
        try { await supabase.rpc('decrement_likes_count', { photo_id: photo.id }); } catch {}
      } else {
        await supabase.from('likes').insert([{ photo_id: photo.id, user_id: currentUser.id }]);
        setLikesCount((n: number) => n + 1);
        setIsLiked(true);
        try { await supabase.rpc('increment_likes_count', { photo_id: photo.id }); } catch {}

        if (photo.user_id && photo.user_id !== currentUser.id) {
          try {
            await supabase.from('notifications').insert([{
              user_id: photo.user_id,
              type: 'like',
              actor_name: currentUser.email?.split('@')[0] || '某用户',
              photo_id: photo.id,
              photo_title: photo.title,
            }]);
          } catch {}
        }
      }
    } finally {
      setLiking(false);
    }
  };

  const handleDownload = async () => {
    const url = photo.image_url || photo.url;
    if (!url) return;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        ctx.font = `bold ${Math.max(20, img.width / 30)}px sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('© 理工光影', img.width - 20, img.height - 20);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.9);
        a.download = `${photo.title || 'photo'}.jpg`;
        a.click();
      };
      img.onerror = () => { window.open(url, '_blank'); };
      img.src = url;
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: photo.title, url: shareUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
      >
        <img
          src={photo.image_url || photo.url}
          alt={photo.title}
          className="w-full h-auto max-h-[80vh] object-contain mx-auto"
        />
      </motion.div>

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={handleLike} disabled={liking} className="flex items-center gap-2 group">
            <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} className={isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'}>
              <Heart size={24} className={isLiked ? 'fill-current' : ''} />
            </motion.div>
            <span className={`font-bold ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>{likesCount}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare size={24} />
            <span className="text-gray-600 font-bold">{photo.comments_count ?? '评论'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleShare} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all">
            <Share2 size={22} />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-shadow shadow-md"
          >
            <Download size={20} />
            <span>高清下载</span>
          </button>
        </div>
      </div>
    </div>
  );
}
