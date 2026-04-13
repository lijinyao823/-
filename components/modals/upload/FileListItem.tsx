'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface FileEntry {
  file: File;
  title: string;
  preview: string;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  error?: string;
}

function sanitizeImageSrc(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'blob:' || parsed.protocol === 'https:') return url;
  } catch {}
  return '';
}

const statusColor = (status: FileEntry['status']) => {
  switch (status) {
    case 'waiting': return 'text-gray-400';
    case 'uploading': return 'text-blue-500';
    case 'success': return 'text-green-500';
    case 'error': return 'text-red-500';
  }
};

const statusLabel = (status: FileEntry['status']) => {
  switch (status) {
    case 'waiting': return '等待';
    case 'uploading': return '上传中';
    case 'success': return '成功';
    case 'error': return '失败';
  }
};

interface Props {
  entry: FileEntry;
  index: number;
  onRemove: (index: number) => void;
  onTitleChange: (index: number, title: string) => void;
}

export default function FileListItem({ entry, index, onRemove, onTitleChange }: Props) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img src={sanitizeImageSrc(entry.preview)} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={entry.title}
          onChange={(e) => onTitleChange(index, e.target.value)}
          placeholder="照片标题（必填）*"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className={`text-xs mt-1 font-medium ${statusColor(entry.status)}`}>
          {statusLabel(entry.status)}
          {entry.error && ` - ${entry.error}`}
        </div>
      </div>
      <button onClick={() => onRemove(index)} className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
