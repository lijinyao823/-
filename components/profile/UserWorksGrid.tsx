'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AlbumManager from '@/components/profile/AlbumManager';
import EditPhotoModal from '@/components/modals/EditPhotoModal';
import AddToAlbumModal from '@/components/modals/AddToAlbumModal';
import WorkPhotoCard from '@/components/profile/WorkPhotoCard';
import WorksTabBar from '@/components/profile/WorksTabBar';

export default function UserWorksGrid() {
  const [activeTab, setActiveTab] = useState<'works' | 'likes' | 'albums'>('works');
  const [works, setWorks] = useState<any[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [albumPhotoId, setAlbumPhotoId] = useState<string | null>(null);
  const router = useRouter();

  const loadData = useCallback(async (user: any) => {
    setLoading(true);
    try {
      const { data: myWorks } = await supabase.from('photos').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setWorks(myWorks || []);

      const { data: likesData } = await supabase.from('likes').select('photo_id').eq('user_id', user.id);
      if (likesData && likesData.length > 0) {
        const photoIds = likesData.map((l: any) => l.photo_id);
        const { data: likedData } = await supabase.from('photos').select('*').in('id', photoIds);
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
      } catch {}
    }
    await supabase.from('photos').delete().eq('id', photo.id).eq('user_id', currentUser.id);
    setWorks(prev => prev.filter(w => w.id !== photo.id));
  };

  const displayPhotos = activeTab === 'works' ? works : likedPhotos;

  return (
    <div className="space-y-8">
      <WorksTabBar
        activeTab={activeTab}
        onChange={setActiveTab}
        worksCount={works.length}
        likesCount={likedPhotos.length}
      />

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
                <WorkPhotoCard
                  key={photo.id}
                  photo={photo}
                  isOwner={activeTab === 'works'}
                  onView={() => router.push(`/photo/${photo.id}`)}
                  onEdit={() => setEditingPhoto(photo)}
                  onDelete={() => handleDelete(photo)}
                  onAddToAlbum={() => setAlbumPhotoId(photo.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSaved={(updated) => {
            setWorks(prev => prev.map(w => w.id === updated.id ? updated : w));
          }}
        />
      )}

      {albumPhotoId && (
        <AddToAlbumModal photoId={albumPhotoId} onClose={() => setAlbumPhotoId(null)} />
      )}
    </div>
  );
}
