'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PhotoGrid from '@/components/PhotoGrid';
import { Loader2, ArrowLeft, Trash2, X } from 'lucide-react';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

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
          const { data: { user } } = await supabase.auth.getUser();
          setIsOwner(!!user && user.id === albumData.user_id);

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

  const handleRemovePhoto = async (photoId: string) => {
    setRemoving(photoId);
    try {
      await supabase.from('album_photos').delete()
        .eq('album_id', id)
        .eq('photo_id', photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } finally {
      setRemoving(null);
    }
  };

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.title}</h1>
            {album.description && <p className="text-gray-500 mb-2">{album.description}</p>}
            <p className="text-gray-400 text-sm">共 {photos.length} 张作品</p>
          </div>
          {isOwner && photos.length > 0 && (
            <button
              onClick={() => setManageMode(m => !m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${manageMode ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {manageMode ? <><X size={14} />退出管理</> : <><Trash2 size={14} />管理照片</>}
            </button>
          )}
        </div>

        {photos.length === 0 ? (
          <p className="text-center py-20 text-gray-400">相册暂无作品</p>
        ) : manageMode ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.image_url || photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    disabled={removing === photo.id}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="从相册移除"
                  >
                    {removing === photo.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-800 truncate">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </div>
  );
}

