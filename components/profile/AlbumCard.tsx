'use client';

import React from 'react';
import Link from 'next/link';
import { FolderOpen, Trash2 } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  photoCount: number;
}

interface Props {
  album: Album;
  onDelete: (albumId: string, title: string) => void;
}

export default function AlbumCard({ album, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
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
        <button onClick={() => onDelete(album.id, album.title)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
