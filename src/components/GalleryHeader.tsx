import React from 'react';
import { SortOption, LocationFilter } from '../types';

interface GalleryHeaderProps {
  filter: string;
  setFilter: (filter: 'all' | 'scenery' | 'humanities' | 'activity') => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  location: LocationFilter;
  setLocation: (loc: LocationFilter) => void;
}

export default function GalleryHeader({ filter, setFilter, sort, setSort, location, setLocation }: GalleryHeaderProps) {
  const categories = [
    { id: 'all', label: '全部' },
    { id: 'scenery', label: '风光' },
    { id: 'humanities', label: '人文' },
    { id: 'activity', label: '活动' }
  ] as const;

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'latest', label: '最新' },
    { id: 'most_liked', label: '最多赞' },
    { id: 'most_commented', label: '最多评论' },
  ];

  const locationOptions: { id: LocationFilter; label: string }[] = [
    { id: 'all', label: '全校区' },
    { id: 'nanhu', label: '南湖' },
    { id: 'mafangshan', label: '马房山' },
    { id: 'yujiato', label: '余家头' },
  ];

  return (
    <div className="flex flex-col gap-6 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        {/* 标题 */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
            作品展示
            <span className="block text-[10px] uppercase tracking-[0.4em] text-blue-600 mt-1 font-bold">
              Project Showcase
            </span>
          </h2>
        </div>

        {/* 分类导航 */}
        <div className="flex nav-container rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`nav-item min-w-[80px] h-[40px] px-6 rounded-xl text-sm font-bold flex items-center justify-center ${filter === cat.id ? 'nav-item-active' : ''}`}
            >
              <span className="transform translate-y-[0.5px]">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 排序与地点筛选 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">排序：</span>
          {sortOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === s.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">校区：</span>
          {locationOptions.map((l) => (
            <button
              key={l.id}
              onClick={() => setLocation(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${location === l.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
