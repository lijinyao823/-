'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PhotoViewer from '@/components/detail/PhotoViewer';
import CommentSection from '@/components/detail/CommentSection';
import PhotoInfoSidebar from '@/components/detail/PhotoInfoSidebar';
import RelatedPhotos from '@/components/detail/RelatedPhotos';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotoDetail() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setPhoto(data);
      } catch (error) {
        console.error('获取详情失败:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPhotoDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold">正在调取作品档案...</p>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="py-20 text-center font-bold text-gray-500">
        作品走丢了... <br />
        <button onClick={() => router.push('/')} className="mt-4 text-blue-600 underline">返回首页</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 group font-bold"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>返回画廊</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <PhotoViewer photo={photo} />
            <CommentSection photoId={photo.id} photoTitle={photo.title} />
          </div>
          <PhotoInfoSidebar photo={photo} />
        </div>

        {photo.category && (
          <RelatedPhotos currentPhotoId={photo.id} category={photo.category} />
        )}
      </div>
    </div>
  );
}
