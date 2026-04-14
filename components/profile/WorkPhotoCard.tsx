'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Grid, Trash2, Heart, FolderPlus, Pencil } from 'lucide-react';

interface Props {
  photo: any;
  isOwner: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToAlbum: () => void;
}

export default function WorkPhotoCard({ photo, isOwner, onView, onEdit, onDelete, onAddToAlbum }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-gray-100"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={onView} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40" title="查看">
            <Grid size={18} />
          </button>
          <button onClick={onAddToAlbum} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40" title="加入相册">
            <FolderPlus size={18} />
          </button>
          {isOwner && (
            <>
              <button onClick={onEdit} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40" title="编辑">
                <Pencil size={18} />
              </button>
              <button onClick={onDelete} className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600" title="删除">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4 flex justify-between items-center">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{photo.title}</h4>
          <p className="text-[10px] text-gray-400">
            {photo.created_at ? new Date(photo.created_at).toLocaleDateString('zh-CN') : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 text-blue-600">
          <Heart size={12} className="fill-current" />
          <span className="text-xs font-bold">{photo.likes_count || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}
