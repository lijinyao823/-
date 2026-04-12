import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Trash2, Heart } from 'lucide-react';
import { MOCK_PHOTOS } from '../../data/mockData';

export default function UserWorksGrid() {
  const [activeTab, setActiveTab] = useState<'works' | 'likes'>('works');
  const userWorks = MOCK_PHOTOS.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100">
        {['works', 'likes'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'works' ? '我的作品' : '赞过的'}
            {activeTab === tab && (
              <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userWorks.map((photo) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-gray-100"
          >
            <div className="aspect-video relative overflow-hidden">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"><Grid size={18} /></button>
                <button className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{photo.title}</h4>
                <p className="text-[10px] text-gray-400">2024-03-20发布</p>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Heart size={12} className="fill-current" />
                <span className="text-xs font-bold">{photo.likes}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}