'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000';

export default function FeaturedCarousel() {
  const [images, setImages] = useState<string[]>([FALLBACK_IMAGE]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('photos')
        .select('image_url, url')
        .eq('featured', true)
        .limit(5);

      if (data && data.length > 0) {
        setImages(
          data
            .map((p: any) => p.image_url || p.url)
            .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
        );
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Featured ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}
