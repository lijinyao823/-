'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface Props {
  defaultValue?: string;
}

export default function NavSearchBar({ defaultValue = '' }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative hidden sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="探索校园光影..."
        className="pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-600/20 focus:bg-white focus:w-80 w-48 lg:w-64 transition-all duration-500 ease-out outline-none"
      />
    </form>
  );
}
