'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface Achievement {
  icon: string;
  title: string;
  color: string;
}

interface Props {
  achievements: Achievement[];
}

export default function AchievementsPanel({ achievements }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award size={18} className="text-yellow-500" />
        <span>荣誉成就</span>
      </h3>
      {achievements.length === 0 ? (
        <p className="text-xs text-gray-400">上传你的第一张作品，开启荣誉之旅！</p>
      ) : (
        <div className="space-y-3">
          {achievements.map(item => (
            <div key={item.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
