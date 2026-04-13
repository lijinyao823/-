'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => void;
  isDragging: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  allowedTypes: string[];
  maxSizeMB: number;
}

export default function DropZone({ onFiles, isDragging, onDragEnter, onDragLeave, allowedTypes, maxSizeMB }: Props) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) onFiles(selected);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        选择照片 * <span className="text-gray-400 font-normal text-xs">（JPG/PNG/WEBP，最大 {maxSizeMB}MB，支持多选）</span>
      </label>
      <label
        className={`group relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
        onDragOver={(e) => { e.preventDefault(); onDragEnter(); }}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-slate-400">
          <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />
          <span className="text-sm">点击上传或拖拽文件到此处（可多选）</span>
          <span className="text-xs mt-1">支持 JPG, PNG, WEBP</span>
        </div>
        <input type="file" accept={allowedTypes.join(',')} multiple className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}
