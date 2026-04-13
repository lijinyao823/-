'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, Hash } from 'lucide-react';

interface TagWithCount {
  id: string;
  name: string;
  count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch all tags with photo counts via photo_tags
        const { data } = await supabase
          .from('tags')
          .select('id, name, photo_tags(count)');

        if (data) {
          const withCounts: TagWithCount[] = data
            .map((t: any) => ({
              id: t.id,
              name: t.name,
              count: Array.isArray(t.photo_tags) ? (t.photo_tags[0]?.count ?? 0) : 0,
            }))
            .filter((t: TagWithCount) => t.count > 0)
            .sort((a: TagWithCount, b: TagWithCount) => b.count - a.count);
          setTags(withCounts);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCount = tags[0]?.count || 1;

  // Map count to font size (rem) between 0.75 and 2.5
  const fontSize = (count: number) => {
    const ratio = count / maxCount;
    return 0.75 + ratio * 1.75;
  };

  // Map count to opacity
  const opacity = (count: number) => {
    const ratio = count / maxCount;
    return 0.5 + ratio * 0.5;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Hash size={28} className="text-blue-600" />
            标签探索
          </h1>
          <p className="text-gray-500">发现热门标签，探索更多精彩作品</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={36} />
          </div>
        ) : tags.length === 0 ? (
          <p className="text-center py-20 text-gray-400">暂无标签数据</p>
        ) : (
          <>
            {/* Tag Cloud */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">标签词云</h2>
              <div className="flex flex-wrap gap-3 items-center justify-center min-h-[200px]">
                {tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tag/${encodeURIComponent(tag.name)}`}
                    style={{
                      fontSize: `${fontSize(tag.count)}rem`,
                      opacity: opacity(tag.count),
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold transition-all hover:opacity-100 hover:scale-110 inline-block"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tag list with counts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">热门标签排行</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tags.slice(0, 40).map((tag, index) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${encodeURIComponent(tag.name)}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">#{index + 1}</span>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 truncate transition-colors">
                        {tag.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-1 bg-gray-200 group-hover:bg-blue-100 group-hover:text-blue-600 px-2 py-0.5 rounded-full transition-colors">
                      {tag.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
