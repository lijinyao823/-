'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FolderOpen } from 'lucide-react';

interface Props {
  activeTab: 'works' | 'likes' | 'albums';
  onChange: (tab: 'works' | 'likes' | 'albums') => void;
  worksCount: number;
  likesCount: number;
}

export default function WorksTabBar({ activeTab, onChange, worksCount, likesCount }: Props) {
  const tabs = [
    { id: 'works' as const, label: `我的作品 (${worksCount})` },
    { id: 'likes' as const, label: `赞过的 (${likesCount})` },
    { id: 'albums' as const, label: '相册' },
  ];

  return (
    <div className="flex gap-8 border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {tab.id === 'albums' && <FolderOpen size={14} />}
          {tab.label}
          {activeTab === tab.id && (
            <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
