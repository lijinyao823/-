import React from 'react';

interface GalleryHeaderProps {
  filter: string;
  setFilter: (filter: 'all' | 'scenery' | 'humanities' | 'activity') => void;
}

export default function GalleryHeader({ filter, setFilter }: GalleryHeaderProps) {
  const categories = [
    { id: 'all', label: '全部' },
    { id: 'scenery', label: '风光' },
    { id: 'humanities', label: '人文' },
    { id: 'activity', label: '活动' }
  ] as const;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8">
      {/* 标题部分：保持干练 */}
      <div className="relative">
        <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
          作品展示
          <span className="block text-[10px] uppercase tracking-[0.4em] text-blue-600 mt-1 font-bold">
            Project Showcase
          </span>
        </h2>
      </div>

      {/* 极简对称导航栏 */}
      <div className="flex nav-container rounded-2xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`
              nav-item
              min-w-[80px] h-[40px] px-6
              rounded-xl text-sm font-bold
              flex items-center justify-center
              ${filter === cat.id 
                ? 'nav-item-active' 
                : ''
              }
            `}
          >
            {/* translate-y-[0.5px] 是为了抵消中文字体视觉偏差，实现绝对中心 */}
            <span className="transform translate-y-[0.5px]">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}