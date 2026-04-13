'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion } from 'motion/react';
import { Loader2, PlusCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import UploadModal from '@/components/modals/UploadModal';
import HeroSection from '@/components/home/HeroSection';
import FeedTabsAndFilters from '@/components/home/FeedTabsAndFilters';
import { SortOption, LocationFilter } from '@/types';

const PAGE_SIZE = 12;

const LOCATION_MAP: Record<LocationFilter, string> = {
  all: '',
  nanhu: '南湖',
  mafangshan: '马房山',
  yujiato: '余家头',
};

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';

  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const [filter, setFilter] = useState<'all' | 'scenery' | 'humanities' | 'activity'>('all');
  const [sort, setSort] = useState<SortOption>('latest');
  const [location, setLocation] = useState<LocationFilter>('all');
  const [showGallery, setShowGallery] = useState(false);

  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPhotos = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : pageRef.current;

      if (feedTab === 'following') {
        if (!currentUser) { setAllPhotos([]); setLoading(false); return; }
        const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
        const followingIds = (followData || []).map((f: any) => f.following_id);
        if (followingIds.length === 0) { setAllPhotos([]); setHasMore(false); setLoading(false); return; }

        let query = supabase.from('photos').select('*').in('user_id', followingIds).range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);
        if (sort === 'latest') query = query.order('created_at', { ascending: false });
        else if (sort === 'most_liked') query = query.order('likes_count', { ascending: false });
        else if (sort === 'most_commented') query = query.order('comments_count', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        const newPhotos = data || [];
        if (reset) { setAllPhotos(newPhotos); pageRef.current = 1; } else { setAllPhotos(prev => [...prev, ...newPhotos]); pageRef.current += 1; }
        setHasMore(newPhotos.length === PAGE_SIZE);
      } else {
        let query = supabase.from('photos').select('*').range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);
        if (filter !== 'all') query = query.eq('category', filter);
        const locStr = LOCATION_MAP[location];
        if (locStr) query = query.ilike('location', `%${locStr}%`);
        if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
        if (sort === 'latest') query = query.order('created_at', { ascending: false });
        else if (sort === 'most_liked') query = query.order('likes_count', { ascending: false });
        else if (sort === 'most_commented') query = query.order('comments_count', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        const newPhotos = data || [];
        if (reset) { setAllPhotos(newPhotos); pageRef.current = 1; } else { setAllPhotos(prev => [...prev, ...newPhotos]); pageRef.current += 1; }
        setHasMore(newPhotos.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('获取画廊数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, sort, location, searchQuery, feedTab, currentUser]);

  useEffect(() => {
    pageRef.current = 0;
    setHasMore(true);
    fetchPhotos(true);
  }, [filter, sort, location, searchQuery, fetchPhotos, feedTab]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showGallery) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !loading && hasMore) fetchPhotos(false); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [showGallery, loading, hasMore, fetchPhotos]);

  const handleExplore = () => {
    setShowGallery(true);
    setTimeout(() => {
      const element = document.getElementById('gallery');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection onExplore={handleExplore} onUpload={() => setIsUploadModalOpen(true)} />

      {showGallery && (
        <motion.section
          id="gallery"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          {feedTab === 'following' && !currentUser ? (
            <div className="text-center py-20 text-gray-400 italic">
              <a href="/login" className="text-blue-600 underline">登录</a>后查看关注的人的作品
            </div>
          ) : (
            <>
              <FeedTabsAndFilters
                feedTab={feedTab}
                setFeedTab={setFeedTab}
                filter={filter}
                setFilter={setFilter}
                sort={sort}
                setSort={setSort}
                location={location}
                setLocation={setLocation}
                searchQuery={searchQuery}
                photosCount={allPhotos.length}
              />

              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold"
                >
                  <PlusCircle size={18} />
                  上传光影
                </button>
              </div>

              {allPhotos.length === 0 && !loading ? (
                <div className="text-center py-20 text-gray-400 italic">
                  {feedTab === 'following' ? '关注的摄影师还没有发布作品' : searchQuery ? `没有找到"${searchQuery}"相关的作品。` : '这片区域暂时还没有光影，期待你的第一张作品。'}
                </div>
              ) : (
                <PhotoGrid photos={allPhotos} />
              )}

              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loading && <Loader2 className="animate-spin text-gray-400" size={28} />}
                {!loading && !hasMore && allPhotos.length > 0 && (
                  <p className="text-gray-400 text-sm">已加载全部作品 ✓</p>
                )}
              </div>
            </>
          )}
        </motion.section>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchPhotos(true);
          setIsUploadModalOpen(false);
          setShowGallery(true);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}
