'use client';

import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  photoCount?: number;
}

interface Props {
  albums: Album[];
}

export default function AlbumGrid({ albums }: Props) {
  if (albums.length === 0) {
    return <p className="text-center text-gray-400 italic py-12">暂无相册</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {albums.map(album => (
        <Link
          key={album.id}
          href={`/album/${album.id}`}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="aspect-video bg-gray-100 overflow-hidden relative">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen size={40} className="text-gray-300" />
              </div>
            )}
            {album.photoCount !== undefined && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {album.photoCount} 张
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-sm">{album.title}</h3>
            {album.description && (
              <p className="text-xs text-gray-400 mt-1 truncate">{album.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
