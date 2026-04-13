import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LightboxPhoto {
  id: string;
  title: string;
  url?: string;
  image_url?: string;
  author_name?: string;
  author?: string;
}

interface Props {
  photos: LightboxPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ photos, currentIndex, onClose, onNext, onPrev }: Props) {
  const navigate = useNavigate();
  const photo = photos[currentIndex];
  const imgSrc = photo?.image_url || photo?.url || '';
  const authorName = photo?.author_name || photo?.author || '匿名';

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* 左箭头 */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* 右箭头 */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* 图片 */}
        <motion.div
          key={photo.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="max-w-5xl max-h-[85vh] mx-auto px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imgSrc}
            alt={photo.title}
            className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
          <div className="flex items-center justify-between mt-3 px-1">
            <div>
              <p className="text-white font-bold text-base">{photo.title}</p>
              <p className="text-white/60 text-sm">{authorName}</p>
            </div>
            <button
              onClick={() => navigate(`/photo/${photo.id}`)}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ExternalLink size={14} />
              查看详情
            </button>
          </div>
          {/* 分页指示点 */}
          <div className="flex justify-center gap-1.5 mt-3">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
