'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

interface Props {
  photos: any[];
}

export default function UserPhotosGrid({ photos }: Props) {
  const router = useRouter();

  if (photos.length === 0) {
    return <p className="text-center py-16 text-gray-400 italic">这位摄影师还没有发布作品</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map(p => (
        <div
          key={p.id}
          onClick={() => router.push(`/photo/${p.id}`)}
          className="cursor-pointer group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={p.image_url || p.url}
              alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-3">
            <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
            <div className="flex items-center gap-1 mt-1 text-gray-400">
              <Heart size={10} />
              <span className="text-xs">{p.likes_count || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
