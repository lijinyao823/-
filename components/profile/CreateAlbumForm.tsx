'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
  newTitle: string;
  newDesc: string;
  creating: boolean;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function CreateAlbumForm({ newTitle, newDesc, creating, onTitleChange, onDescChange, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-gray-900">新建相册</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <input
        type="text"
        placeholder="相册名称 *"
        value={newTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <textarea
        placeholder="相册描述（可选）"
        value={newDesc}
        onChange={(e) => onDescChange(e.target.value)}
        rows={2}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={creating || !newTitle.trim()}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {creating ? <Loader2 className="animate-spin" size={16} /> : null}
          创建
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          取消
        </button>
      </div>
    </div>
  );
}
