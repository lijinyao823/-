'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, FolderPlus, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  photoId: string;
  onClose: () => void;
}

export default function AddToAlbumModal({ photoId, onClose }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [inAlbums, setInAlbums] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: albumsData } = await supabase
        .from('albums')
        .select('id, title, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setAlbums(albumsData || []);

      if (albumsData && albumsData.length > 0) {
        const albumIds = albumsData.map((a: any) => a.id);
        const { data: existing } = await supabase
          .from('album_photos')
          .select('album_id')
          .in('album_id', albumIds)
          .eq('photo_id', photoId);
        setInAlbums(new Set((existing || []).map((e: any) => e.album_id)));
      }
      setLoading(false);
    }
    load();
  }, [photoId]);

  const handleToggle = async (albumId: string) => {
    setToggling(albumId);
    try {
      if (inAlbums.has(albumId)) {
        await supabase.from('album_photos').delete()
          .eq('album_id', albumId)
          .eq('photo_id', photoId);
        setInAlbums(prev => { const s = new Set(prev); s.delete(albumId); return s; });
      } else {
        // Get current max order
        const { data: maxRow } = await supabase
          .from('album_photos')
          .select('order')
          .eq('album_id', albumId)
          .order('order', { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextOrder = (maxRow?.order ?? -1) + 1;
        await supabase.from('album_photos').insert([{ album_id: albumId, photo_id: photoId, order: nextOrder }]);
        setInAlbums(prev => new Set([...prev, albumId]));
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FolderPlus size={18} className="text-blue-600" />
            加入相册
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : albums.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              还没有相册，请先在个人中心创建相册
            </p>
          ) : (
            <div className="space-y-2">
              {albums.map(album => {
                const isIn = inAlbums.has(album.id);
                const busy = toggling === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => handleToggle(album.id)}
                    disabled={busy}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${isIn ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{album.title}</p>
                      {album.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{album.description}</p>
                      )}
                    </div>
                    {busy ? (
                      <Loader2 className="animate-spin text-blue-500" size={16} />
                    ) : isIn ? (
                      <Check size={18} className="text-blue-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
