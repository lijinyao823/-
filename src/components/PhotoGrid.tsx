import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 建议使用路由跳转

interface PhotoGridProps {
  photos: any[]; 
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 p-4">
      {photos.map((photo) => {
        const isExpanded = expandedId === photo.id;
        
        return (
          <div 
            key={photo.id}
            className="relative mb-4 break-inside-avoid cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => {
              if (isExpanded) {
                // 跳转到详情页
                navigate(`/photo/${photo.id}`);
              } else {
                setExpandedId(photo.id);
              }
            }}
          >
            {/* 照片正面 */}
            <motion.div
              animate={{ z: isExpanded ? 50 : 0 }}
              className="relative z-20 rounded-xl overflow-hidden shadow-md bg-white"
            >
              {/* 注意：这里的 photo.url 对应你数据库里的 url 字段 */}
              <img 
                src={photo.url} 
                alt={photo.title}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
              />
              <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-800">{photo.title}</h3>
              </div>
            </motion.div>

            {/* 折叠信息层 */}
            <motion.div
              initial={false}
              animate={{ 
                rotateX: isExpanded ? 0 : -90,
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
                marginTop: isExpanded ? 0 : -20
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              style={{ transformOrigin: "top" }}
              className="relative z-10 bg-gray-50 rounded-b-xl p-4 shadow-inner border-t border-gray-100"
            >
              {/* 字段匹配：photo.author_name 是我们在 SQL 里定义的 */}
              <p className="text-sm text-gray-600 font-medium">作者：{photo.author_name || '匿名校友'}</p>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                {photo.description || "暂无描述，点击进入详情页查看更多参数"}
              </p>
              
              <div className="mt-3 text-blue-600 text-xs font-bold flex items-center gap-1">
                查看详情 <ArrowRight size={12} />
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}