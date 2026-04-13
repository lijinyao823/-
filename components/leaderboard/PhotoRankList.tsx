'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import RankItem from '@/components/leaderboard/RankItem';

interface Props {
  photos: any[];
  medals: string[];
}

export default function PhotoRankList({ photos, medals }: Props) {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart size={18} className="text-red-500" />
        作品排行 TOP 10
      </h2>
      <div className="space-y-3">
        {photos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
        ) : photos.map((p, i) => (
          <RankItem
            key={p.id}
            rank={i}
            medals={medals}
            imageUrl={p.image_url || p.url}
            name={p.title}
            subLabel={p.author_name || '匿名'}
            likesCount={p.likes_count || 0}
            onClick={() => router.push(`/photo/${p.id}`)}
            isPhoto={true}
          />
        ))}
      </div>
    </div>
  );
}
