import React, { useEffect, useRef } from 'react';
import Ola from 'ola';

interface LiquidButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export default function LiquidButton({ text, onClick, className }: LiquidButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const offset = 32;
    const foreground = '#2563eb'; // 武理蓝

    let points: [number, number][] = [];
    let position: any;
    let distance: any;
    let animationFrameId: number;

    const initOla = () => {
      distance = Ola({ value: offset }, 200);
      position = Ola({
        x: canvas.width / 2,
        y: canvas.height / 2
      }, 200);
    };

    const size = () => {
      const rect = container.getBoundingClientRect();
      // 画布尺寸要包含 offset 的两倍
      canvas.width = rect.width + offset * 2;
      canvas.height = rect.height + offset * 2;

      if (!position) {
        initOla();
      } else {
        position.set({ x: canvas.width / 2, y: canvas.height / 2 });
      }

      const pixelsWidth = rect.width;
      const pixelsHeight = rect.height;
      
      points = [];
      // 顺时针构建路径点，严格基于容器尺寸加上 offset
      for (let i = 0; i < pixelsWidth; i++) points.push([offset + i, offset]);
      for (let i = 0; i < pixelsHeight; i++) points.push([offset + pixelsWidth, offset + i]);
      for (let i = 0; i < pixelsWidth; i++) points.push([offset + pixelsWidth - i, offset + pixelsHeight]);
      for (let i = 0; i < pixelsHeight; i++) points.push([offset, offset + pixelsHeight - i]);
    };

    const attract = (point: [number, number]) => {
      const [x, y] = point;
      const dx = x - position.x;
      const dy = y - position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dist2 = Math.max(1, dist);
      const d = Math.min(dist2, Math.max(12, (dist2 / 4) - dist2));
      const D = dist2 * distance.value;

      return [
        x + (d / D) * (position.x - x),
        y + (d / D) * (position.y - y)
      ];
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = foreground;
      ctx.beginPath();
      
      points.forEach((point, index) => {
        const [vx, vy] = attract(point);
        if (index === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      });
      
      ctx.closePath();
      ctx.fill();
    };

    const loop = () => {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      position.set({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }, 150);
    };

    const handleMouseEnter = () => {
      distance.set({ value: 1 }, 200);
    };

    const handleMouseLeave = () => {
      position.set({ x: canvas.width / 2, y: canvas.height / 2 }, 1000);
      distance.set({ value: offset }, 12000);
    };

    size();
    loop();

    window.addEventListener('resize', size);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', size);
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <a 
      ref={containerRef}
      href="#" 
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      // 1. 使用 inline-flex 和 items-center justify-center 实现文字绝对居中
      className={`relative inline-flex items-center justify-center px-12 py-5 no-underline group ${className}`}
      style={{ cursor: 'pointer', minWidth: '180px' }}
    >
      <canvas 
        ref={canvasRef}
        // 2. 这里的 top 和 left 必须和代码中的 offset (-32px) 对应
        className="absolute pointer-events-none transition-opacity duration-1000 group-hover:opacity-90 group-active:opacity-100"
        style={{ 
          top: '-32px', 
          left: '-32px', 
          width: 'calc(100% + 64px)', 
          height: 'calc(100% + 64px)',
          zIndex: 0 
        }}
      />
      {/* 3. 文字设置 text-center 并移除可能干扰的 margin */}
      <span className="relative z-10 text-white font-bold tracking-wider pointer-events-none text-center">
        {text}
      </span>
    </a>
  );
}