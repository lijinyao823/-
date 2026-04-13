import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// children 代表被这个布局包裹的各个路由页面（如 Home, Detail, Profile）
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    /**
     * flex-col + min-h-screen: 确保当页面内容很少时，Footer 依然能固定在屏幕最底部，
     * 而不会飘到屏幕中间。
     */
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 selection:bg-blue-100">
      
      {/* 导航栏：建议在 Navbar 组件内部处理固定定位 (sticky) */}
      <Navbar />

      {/* 主体内容区：
          flex-grow 会撑开剩余空间，确保 Footer 触底。
          w-full max-w-7xl mx-auto：限制最大宽度，在大屏幕（如 2K 屏）上内容不会拉得太散。
      */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
        {children}
      </main>

      {/* 页脚：展示版权信息、武理校徽相关链接等 */}
      <Footer />
    </div>
  );
}