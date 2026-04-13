'use client';

import React from 'react';
import { Search } from 'lucide-react';
import GalleryHeader from '@/components/layout/GalleryHeader';
import { SortOption, LocationFilter } from '@/types';

interface Props {
  feedTab: 'all' | 'following';
  setFeedTab: (tab: 'all' | 'following') => void;
  filter: 'all' | 'scenery' | 'humanities' | 'activity';
  setFilter: (f: 'all' | 'scenery' | 'humanities' | 'activity') => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  location: LocationFilter;
  setLocation: (l: LocationFilter) => void;
  searchQuery?: string;
  photosCount?: number;
}

export default function FeedTabsAndFilters({
  feedTab, setFeedTab, filter, setFilter, sort, setSort, location, setLocation, searchQuery = '', photosCount = 0,
}: Props) {
  return (
    <>
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: '全部' },
          { id: 'following', label: '关注的人' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFeedTab(tab.id as 'all' | 'following')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${feedTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 mb-4">
        {feedTab === 'all' && (
          <GalleryHeader
            filter={filter}
            setFilter={setFilter}
            sort={sort}
            setSort={setSort}
            location={location}
            setLocation={setLocation}
          />
        )}

        {searchQuery && (
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <Search size={14} />
            搜索"{searchQuery}"的结果，共 {photosCount} 张
          </div>
        )}
      </div>
    </>
  );
}
