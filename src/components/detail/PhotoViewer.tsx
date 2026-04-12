import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2, Download } from 'lucide-react';

export default function PhotoViewer({ photo }: { photo: any }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="lg:col-span-2 space-y-8">
      {/* 图片卡片 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
      >
        <img 
          src={photo.url} 
          alt={photo.title} 
          className="w-full h-auto max-h-[80vh] object-contain mx-auto"
        />
      </motion.div>

      {/* 底部交互条 */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-2 group">
            <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} className={isLiked ? "text-red-500" : "text-gray-400 group-hover:text-red-500"}>
              <Heart size={24} className={isLiked ? "fill-current" : ""} />
            </motion.div>
            <span className={`font-bold ${isLiked ? "text-red-500" : "text-gray-600"}`}>
              {isLiked ? photo.likes + 1 : photo.likes}
            </span>
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare size={24} />
            <span className="text-gray-600 font-bold">评论</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all"><Share2 size={22} /></button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-shadow shadow-md">
            <Download size={20} />
            <span>高清下载</span>
          </button>
        </div>
      </div>
    </div>
  );
}