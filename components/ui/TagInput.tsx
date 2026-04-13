'use client';

import React, { KeyboardEvent } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = '添加标签...' }: Props) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/^[,#]+|[,#]+$/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
        <TagIcon size={14} /> 标签（用空格、逗号或回车分隔）
      </label>
      <div className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap gap-2 min-h-[48px]">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
        />
      </div>
    </div>
  );
}
