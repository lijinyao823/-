import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
// 1. 引入 supabase 客户端
import { supabase } from '../lib/supabase'; 

// 导入拆分后的组件
import PhotoViewer from '../components/detail/PhotoViewer';
import CommentSection from '../components/detail/CommentSection';
import PhotoInfoSidebar from '../components/detail/PhotoInfoSidebar';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 2. 定义状态：存储从数据库拿到的照片数据
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 3. 核心：根据 ID 去 Supabase 查数据
  useEffect(() => {
    async function fetchPhotoDetail() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('photos') // 对应你在云端建的表名
          .select('*')
          .eq('id', id)   // 匹配 ID
          .single();      // 只需要一条数据

        if (error) throw error;
        setPhoto(data);
      } catch (error) {
        console.error('获取详情失败:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPhotoDetail();
  }, [id]);

  // 4. 加载状态展示
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold">正在调取作品档案...</p>
      </div>
    );
  }

  // 5. 错误状态展示
  if (!photo) {
    return (
      <div className="py-20 text-center font-bold text-gray-500">
        作品走丢了... <br />
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">返回首页</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 group font-bold"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>返回画廊</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 左侧：图片 + 评论 */}
          <div className="lg:col-span-2 space-y-12">
            {/* 这里的 photo 已经是来自 Supabase 的真实数据 */}
            <PhotoViewer photo={photo} />
            
            {/* 评论区也需要传入 photoId 以便根据作品显示评论 */}
            <CommentSection photoId={photo.id} />
          </div>

          {/* 右侧：资料详情（相机参数等） */}
          <PhotoInfoSidebar photo={photo} />
        </div>
      </div>
    </div>
  );
}