'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2 } from 'lucide-react';
import CreateAlbumForm from '@/components/profile/CreateAlbumForm';
import AlbumCard from '@/components/profile/AlbumCard';

interface Props {
  userId?: string;
  userPhotos: any[];
}

export default function AlbumManager({ userId, userPhotos }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userId) loadAlbums();
  }, [userId]);

  async function loadAlbums() {
    setLoading(true);
    try {
      const { data } = await supabase.from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (data) {
        const enriched = await Promise.all(
          data.map(async (album: any) => {
            const { count } = await supabase.from('album_photos').select('photo_id', { count: 'exact', head: true }).eq('album_id', album.id);
            let coverUrl = null;
            if (album.cover_photo_id) {
              const { data: photo } = await supabase.from('photos').select('image_url, url').eq('id', album.cover_photo_id).maybeSingle();
              coverUrl = photo?.image_url || photo?.url;
            } else {
              const { data: firstPhoto } = await supabase.from('album_photos').select('photos(image_url, url)').eq('album_id', album.id).order('order', { ascending: true }).limit(1).maybeSingle();
              coverUrl = (firstPhoto?.photos as any)?.image_url || (firstPhoto?.photos as any)?.url;
            }
            return { ...album, photoCount: count || 0, coverUrl };
          })
        );
        setAlbums(enriched);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !userId) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('albums').insert([{ user_id: userId, title: newTitle.trim(), description: newDesc.trim() || null }]);
      if (!error) {
        setNewTitle('');
        setNewDesc('');
        setShowCreate(false);
        loadAlbums();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (albumId: string, title: string) => {
    if (!confirm(`确定删除相册"${title}"吗？`)) return;
    await supabase.from('album_photos').delete().eq('album_id', albumId);
    await supabase.from('albums').delete().eq('id', albumId);
    setAlbums(prev => prev.filter(a => a.id !== albumId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{albums.length} 个相册</p>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          创建相册
        </button>
      </div>

      {showCreate && (
        <CreateAlbumForm
          newTitle={newTitle}
          newDesc={newDesc}
          creating={creating}
          onTitleChange={setNewTitle}
          onDescChange={setNewDesc}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {albums.length === 0 ? (
        <p className="text-center text-gray-400 italic py-12">还没有创建任何相册</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
