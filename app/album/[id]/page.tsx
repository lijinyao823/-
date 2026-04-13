'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PhotoGrid from '@/components/PhotoGrid';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: albumData } = await supabase
          .from('albums')
          .select('*')
          .eq('id', id)
          .single();
        setAlbum(albumData);

        if (albumData) {
          const { data: albumPhotos } = await supabase
            .from('album_photos')
            .select('photo_id, order')
            .eq('album_id', id)
            .order('order', { ascending: true });

          if (albumPhotos && albumPhotos.length > 0) {
            const photoIds = albumPhotos.map((ap: any) => ap.photo_id);
            const { data: photosData } = await supabase
              .from('photos')
              .select('*')
              .in('id', photoIds);
            setPhotos(photosData || []);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <p className="font-bold">相册不存在</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 underline">返回</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-6 font-bold"
        >
          <ArrowLeft size={18} />
          返回
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.title}</h1>
        {album.description && <p className="text-gray-500 mb-4">{album.description}</p>}
        <p className="text-gray-400 text-sm mb-8">共 {photos.length} 张作品</p>

        {photos.length === 0 ? (
          <p className="text-center py-20 text-gray-400">相册暂无作品</p>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </div>
  );
}
