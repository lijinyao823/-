'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import RankItem from '@/components/leaderboard/RankItem';

interface Props {
  photographers: any[];
  medals: string[];
}

export default function PhotographerRankList({ photographers, medals }: Props) {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Camera size={18} className="text-blue-600" />
        摄影师排行 TOP 10
      </h2>
      <div className="space-y-3">
        {photographers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
        ) : photographers.map((p, i) => (
          <RankItem
            key={p.user_id}
            rank={i}
            medals={medals}
            name={p.name}
            subLabel={`${p.count} 件作品`}
            likesCount={p.totalLikes}
            onClick={() => router.push(`/user/${p.user_id}`)}
            isPhoto={false}
          />
        ))}
      </div>
    </div>
  );
}
