'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion } from 'motion/react';
import { Loader2, PlusCircle, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import GalleryHeader from '@/components/layout/GalleryHeader';
import LiquidButton from '@/components/ui/LiquidButton';
import UploadModal from '@/components/modals/UploadModal';
import FeaturedCarousel from '@/components/gallery/FeaturedCarousel';
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
  const [page, setPage] = useState(0);
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
        if (!currentUser) {
          setAllPhotos([]);
          setLoading(false);
          return;
        }
        // Get followed user IDs
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id);
        const followingIds = (followData || []).map((f: any) => f.following_id);

        if (followingIds.length === 0) {
          setAllPhotos([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        let query = supabase
          .from('photos')
          .select('*')
          .in('user_id', followingIds)
          .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

        if (sort === 'latest') query = query.order('created_at', { ascending: false });
        else if (sort === 'most_liked') query = query.order('likes_count', { ascending: false });
        else if (sort === 'most_commented') query = query.order('comments_count', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        const newPhotos = data || [];
        if (reset) {
          setAllPhotos(newPhotos);
          pageRef.current = 1;
          setPage(1);
        } else {
          setAllPhotos(prev => [...prev, ...newPhotos]);
          pageRef.current += 1;
          setPage(p => p + 1);
        }
        setHasMore(newPhotos.length === PAGE_SIZE);
      } else {
        let query = supabase
          .from('photos')
          .select('*')
          .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

        if (filter !== 'all') query = query.eq('category', filter);
        const locStr = LOCATION_MAP[location];
        if (locStr) query = query.ilike('location', `%${locStr}%`);
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
        }
        if (sort === 'latest') query = query.order('created_at', { ascending: false });
        else if (sort === 'most_liked') query = query.order('likes_count', { ascending: false });
        else if (sort === 'most_commented') query = query.order('comments_count', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        const newPhotos = data || [];
        if (reset) {
          setAllPhotos(newPhotos);
          pageRef.current = 1;
          setPage(1);
        } else {
          setAllPhotos(prev => [...prev, ...newPhotos]);
          pageRef.current += 1;
          setPage(p => p + 1);
        }
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
    setPage(0);
    setHasMore(true);
    fetchPhotos(true);
  }, [filter, sort, location, searchQuery, fetchPhotos, feedTab]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showGallery) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchPhotos(false);
        }
      },
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
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <FeaturedCarousel />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            记录武理，光影随行
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mb-12 leading-relaxed"
          >
            在每一个光影交错的瞬间，发现武汉理工大学的灵魂。
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <LiquidButton text="探索画廊" onClick={handleExplore} />
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full transition-all hover:scale-105 active:scale-95 font-medium"
            >
              <PlusCircle size={20} />
              发布作品
            </motion.button>
          </div>
        </div>
      </section>

      {showGallery && (
        <motion.section
          id="gallery"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          {/* Feed tabs */}
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

          {feedTab === 'following' && !currentUser ? (
            <div className="text-center py-20 text-gray-400 italic">
              <a href="/login" className="text-blue-600 underline">登录</a>后查看关注的人的作品
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mb-4">
                {feedTab === 'all' && (
                  <GalleryHeader
                    filter={filter}
                    setFilter={(f) => { setFilter(f); }}
                    sort={sort}
                    setSort={(s) => { setSort(s); }}
                    location={location}
                    setLocation={(l) => { setLocation(l); }}
                  />
                )}

                {searchQuery && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <Search size={14} />
                    搜索"{searchQuery}"的结果，共 {allPhotos.length} 张
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold"
                  >
                    <PlusCircle size={18} />
                    上传光影
                  </button>
                </div>
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
