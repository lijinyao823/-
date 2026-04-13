'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Globe, ExternalLink, Github, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F8F9FA] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-wut-blue mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-wut-blue rounded-full"></span>
              理工光影
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              武汉理工大学校园摄影展示平台。我们用镜头捕捉卓越时刻，用光影记录武理芳华。
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-wut-blue transition-all hover:-translate-y-1">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-wut-blue transition-all hover:-translate-y-1">
                <Github size={18} />
              </a>
              <a href="mailto:contact@wutphoto.edu.cn" className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-wut-blue transition-all hover:-translate-y-1">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-6">探索平台</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm text-gray-500 hover:text-wut-blue transition-colors">精选作品</Link></li>
              <li><Link href="/profile" className="text-sm text-gray-500 hover:text-wut-blue transition-colors">摄影师风采</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-wut-blue transition-colors">版权声明</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-6">校园入口</h4>
            <ul className="space-y-4">
              <li>
                <a href="https://www.whut.edu.cn/" target="_blank" rel="noopener noreferrer"
                   className="text-sm text-gray-500 hover:text-wut-blue transition-all flex items-center gap-1 group">
                  <Globe size={14} />
                  武汉理工大学官网
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li><a href="https://i.whut.edu.cn/" className="text-sm text-gray-500 hover:text-wut-blue transition-colors">智慧理工</a></li>
              <li><a href="http://lib.whut.edu.cn/" className="text-sm text-gray-500 hover:text-wut-blue transition-colors">校图书馆</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-6">联系我们</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={18} className="text-wut-blue shrink-0" />
                <span>湖北省武汉市洪山区<br/>珞狮路122号马房山校区</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={18} className="text-wut-blue shrink-0" />
                <span>contact@whut.edu.cn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 tracking-widest uppercase">
            © {currentYear} 武汉理工大学 · 理工光影摄影社团 · 卓越同行
          </p>
        </div>
      </div>
    </footer>
  );
}
