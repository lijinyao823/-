'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface Props {
  rank: number;
  medals: string[];
  imageUrl?: string;
  name: string;
  subLabel: string;
  likesCount: number;
  onClick: () => void;
  isPhoto?: boolean;
}

export default function RankItem({ rank, medals, imageUrl, name, subLabel, likesCount, onClick, isPhoto = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      <span className="text-xl w-8 text-center flex-shrink-0">
        {rank < 3 ? medals[rank] : `${rank + 1}`}
      </span>
      {isPhoto ? (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {imageUrl && <img src={imageUrl} alt={name} className="w-full h-full object-cover" />}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
          {name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
        <p className="text-xs text-gray-400">{subLabel}</p>
      </div>
      <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
        <Heart size={14} className="fill-current" />
        <span className="text-sm font-bold">{likesCount}</span>
      </div>
    </motion.div>
  );
}
