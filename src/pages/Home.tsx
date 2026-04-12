import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle } from 'lucide-react';
// 1. 引入 supabase 客户端
import { supabase } from '../lib/supabase'; 
import PhotoGrid from '../components/PhotoGrid';
import GalleryHeader from '../components/GalleryHeader';
import LiquidButton from '../components/LiquidButton';
// 新增：引入上传弹窗组件
import UploadModal from '../components/UploadModal';

export default function Home() {
  const [filter, setFilter] = useState<'all' | 'scenery' | 'humanities' | 'activity'>('all');
  const [showGallery, setShowGallery] = useState(false);
  
  // 定义存储真实数据的状态
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 新增：控制弹窗显隐的状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 3. 获取数据的函数封装（方便重复调用以刷新列表）
  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllPhotos(data || []);
    } catch (error) {
      console.error('获取画廊数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 页面加载时抓取
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // 4. 根据分类过滤
  const filteredPhotos = filter === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.category === filter);

  const handleExplore = () => {
    setShowGallery(true);
    setTimeout(() => {
      const element = document.getElementById('gallery');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000" 
            alt="WUT Campus" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
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
              transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            >
              <LiquidButton 
                text={loading ? "加载中..." : "探索画廊"} 
                onClick={handleExplore} 
              />
            </motion.div>

            {/* 新增：快速发布作品按钮 */}
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

      {/* 2. Gallery Section */}
      {showGallery && (
        <motion.section 
          id="gallery" 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          {/* 标题与分类筛选组件 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <GalleryHeader filter={filter} setFilter={setFilter} />
            
            {/* 画廊区的小发布按钮 */}
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold self-start md:self-auto"
            >
              <PlusCircle size={18} />
              上传光影
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>正在同步云端画廊...</p>
            </div>
          ) : (
            <PhotoGrid photos={filteredPhotos} />
          )}

          {!loading && filteredPhotos.length === 0 && (
            <div className="text-center py-20 text-gray-400 italic">
              这片区域暂时还没有光影，期待你的第一张作品。
            </div>
          )}
        </motion.section>
      )}

      {/* 3. 新增：上传弹窗组件 */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchPhotos(); // 上传成功后重新获取数据
          setIsUploadModalOpen(false); // 关闭弹窗
        }}
      />
    </div> 
  );
}