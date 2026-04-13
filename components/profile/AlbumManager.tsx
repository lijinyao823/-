'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, FolderOpen, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
      const { data } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        // Get photo count for each album
        const enriched = await Promise.all(
          data.map(async (album: any) => {
            const { count } = await supabase
              .from('album_photos')
              .select('photo_id', { count: 'exact', head: true })
              .eq('album_id', album.id);

            let coverUrl = null;
            if (album.cover_photo_id) {
              const { data: photo } = await supabase
                .from('photos')
                .select('image_url, url')
                .eq('id', album.cover_photo_id)
                .maybeSingle();
              coverUrl = photo?.image_url || photo?.url;
            } else {
              // Get first photo in album as cover
              const { data: firstPhoto } = await supabase
                .from('album_photos')
                .select('photos(image_url, url)')
                .eq('album_id', album.id)
                .order('order', { ascending: true })
                .limit(1)
                .maybeSingle();
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
      const { error } = await supabase.from('albums').insert([{
        user_id: userId,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
      }]);
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
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          创建相册
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-900">新建相册</h4>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            placeholder="相册名称 *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <textarea
            placeholder="相册描述（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim()}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="animate-spin" size={16} /> : null}
              创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Albums grid */}
      {albums.length === 0 ? (
        <p className="text-center text-gray-400 italic py-12">还没有创建任何相册</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map(album => (
            <div key={album.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
              <Link href={`/album/${album.id}`} className="block">
                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen size={40} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {album.photoCount} 张
                  </div>
                </div>
              </Link>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <Link href={`/album/${album.id}`} className="font-bold text-gray-900 hover:text-blue-600 text-sm transition-colors">
                    {album.title}
                  </Link>
                  {album.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{album.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(album.id, album.title)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
