'use client';

import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import LiquidButton from '@/components/ui/LiquidButton';
import FeaturedCarousel from '@/components/gallery/FeaturedCarousel';

interface Props {
  onExplore: () => void;
  onUpload: () => void;
}

export default function HeroSection({ onExplore, onUpload }: Props) {
  return (
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
            <LiquidButton text="探索画廊" onClick={onExplore} />
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onUpload}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <PlusCircle size={20} />
            发布作品
          </motion.button>
        </div>
      </div>
    </section>
  );
}
