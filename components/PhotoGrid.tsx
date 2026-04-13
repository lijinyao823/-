'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Lightbox from '@/components/Lightbox';

interface PhotoGridProps {
  photos: any[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 p-4">
        {photos.map((photo, index) => {
          const imgSrc = photo.image_url || photo.url || '';
          const authorName = photo.author_name || photo.author || '匿名校友';
          const likesCount = photo.likes_count ?? photo.likes ?? 0;

          return (
            <div
              key={photo.id}
              className="relative mb-4 break-inside-avoid cursor-pointer group"
              onClick={() => setLightboxIndex(index)}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative rounded-xl overflow-hidden shadow-md bg-white"
              >
                <img
                  src={imgSrc}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold">
                    <Eye size={16} />
                    点击预览
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-800 truncate">{photo.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    {photo.user_id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/user/${photo.user_id}`); }}
                        className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {authorName}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">{authorName}</span>
                    )}
                    <div className="flex items-center gap-1 text-gray-400">
                      <Heart size={12} />
                      <span className="text-xs">{likesCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex(i => Math.min((i ?? 0) + 1, photos.length - 1))}
          onPrev={() => setLightboxIndex(i => Math.max((i ?? 0) - 1, 0))}
        />
      )}
    </>
  );
}
