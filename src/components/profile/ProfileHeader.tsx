import React from 'react';
import { Settings, Upload } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className="bg-white border-b border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 头像 */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-colors">
              <Settings size={18} />
            </button>
          </div>
          
          {/* 资料与统计 */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">武理摄影君</h1>
            <p className="text-gray-500 mb-6 max-w-md text-sm">
              武汉理工大学 22级 艺术设计学院 | 喜欢捕捉校园里的每一个光影瞬间。
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-8">
              {[
                { label: '作品', value: '12' },
                { label: '获赞', value: '1.2k' },
                { label: '粉丝', value: '458' }
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
            <Upload size={18} />
            <span>上传作品</span>
          </button>
        </div>
      </div>
    </div>
  );
}