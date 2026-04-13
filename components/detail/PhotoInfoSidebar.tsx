'use client';

import React, { useEffect, useState } from 'react';
import { Info, MapPin, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PhotoInfoSidebar({ photo }: { photo: any }) {
  const [photoTags, setPhotoTags] = useState<string[]>([]);
  const exif = photo.exif || {};
  const exifItems = [
    { label: '相机', value: exif.camera || '未知' },
    { label: '感光度', value: exif.iso ? `ISO ${exif.iso}` : '未知' },
    { label: '快门', value: exif.shutter || '未知' },
    { label: '光圈', value: exif.aperture || '未知' },
  ];

  const authorName = photo.author_name || photo.author || '匿名';
  const publishDate = photo.created_at
    ? new Date(photo.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未知';

  useEffect(() => {
    async function loadTags() {
      const { data } = await supabase
        .from('photo_tags')
        .select('tags(name)')
        .eq('photo_id', photo.id);
      if (data) {
        const names = data
          .map((pt: any) => pt.tags?.name)
          .filter(Boolean);
        setPhotoTags(names);
      }
    }
    if (photo.id) loadTags();
  }, [photo.id]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{photo.title}</h2>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
            {authorName[0]}
          </div>
          <div>
            {photo.user_id ? (
              <Link href={`/user/${photo.user_id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {authorName}
              </Link>
            ) : (
              <p className="font-bold text-gray-900">{authorName}</p>
            )}
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Calendar size={10} /> {publishDate}
              </span>
              {photo.location && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <MapPin size={10} /> {photo.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">{photo.description || '暂无描述'}</p>

        {/* Tags */}
        {photoTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
              <Tag size={16} className="text-blue-600" />
              <span className="text-sm">标签</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {photoTags.map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-900 font-bold mb-6">
            <Info size={18} className="text-blue-600" />
            <span>参数 (EXIF)</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {exifItems.map(item => (
              <div key={item.label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 p-8 rounded-2xl shadow-lg text-white">
        <h4 className="font-bold mb-2 italic">© Copyright</h4>
        <p className="text-[10px] text-blue-100 leading-relaxed">
          作品版权归作者所有。未经授权，禁止任何形式的商业用途及二次创作。
        </p>
      </div>
    </div>
  );
}
