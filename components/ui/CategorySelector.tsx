'use client';

import React from 'react';

interface Category {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}

export default function CategorySelector({ value, onChange, categories }: Props) {
  return (
    <div className="flex gap-2">
      {categories.map(c => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${value === c.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
