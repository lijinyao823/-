import React, { useState } from 'react';
import { Upload } from 'lucide-react';

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
        isDragging ? 'border-blue-600 bg-blue-50/50 scale-[0.99]' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
        <Upload size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">拖拽上传你的作品</h3>
      <p className="text-gray-400 text-sm mb-8">支持 JPG, PNG, RAW 格式 (最大 20MB)</p>
      <button className="bg-white border border-gray-200 text-gray-600 px-8 py-2.5 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all">
        选择文件
      </button>
    </div>
  );
}