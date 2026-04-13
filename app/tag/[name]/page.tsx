'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PhotoGrid from '@/components/PhotoGrid';
import { Loader2 } from 'lucide-react';

export default function TagPage() {
  const { name } = useParams<{ name: string }>();
  const tagName = decodeURIComponent(name || '');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Find tag id
        const { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();

        if (!tagData) {
          setPhotos([]);
          return;
        }

        // Get photo_ids for this tag
        const { data: photoTagData } = await supabase
          .from('photo_tags')
          .select('photo_id')
          .eq('tag_id', tagData.id);

        if (!photoTagData || photoTagData.length === 0) {
          setPhotos([]);
          return;
        }

        const photoIds = photoTagData.map((pt: any) => pt.photo_id);
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .in('id', photoIds)
          .order('created_at', { ascending: false });

        setPhotos(photosData || []);
      } finally {
        setLoading(false);
      }
    }
    if (tagName) load();
  }, [tagName]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2"># {tagName}</h1>
        <p className="text-gray-500 mb-8">共 {photos.length} 张作品</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={36} />
          </div>
        ) : photos.length === 0 ? (
          <p className="text-center py-20 text-gray-400">该标签下暂无作品</p>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </div>
  );
}
