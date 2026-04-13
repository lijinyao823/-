import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Heart } from 'lucide-react';

interface Props {
  currentPhotoId: string;
  category: string;
}

export default function RelatedPhotos({ currentPhotoId, category }: Props) {
  const [photos, setPhotos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('photos')
        .select('id, title, image_url, url, author_name, likes_count')
        .eq('category', category)
        .neq('id', currentPhotoId)
        .order('likes_count', { ascending: false })
        .limit(4);
      setPhotos(data || []);
    }
    load();
  }, [currentPhotoId, category]);

  if (photos.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-gray-900 mb-6">相关推荐</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/photo/${p.id}`)}
            className="cursor-pointer group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={p.image_url || p.url}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3 bg-white">
              <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
              <div className="flex items-center gap-1 mt-1 text-gray-400">
                <Heart size={10} />
                <span className="text-xs">{p.likes_count || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
