import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import UploadModal from '../UploadModal';

interface Props {
  onSuccess?: () => void;
}

export default function UploadZone({ onSuccess }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => setIsModalOpen(true)}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragging ? 'border-blue-600 bg-blue-50/50 scale-[0.99]' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/20'
        }`}
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">拖拽上传你的作品</h3>
        <p className="text-gray-400 text-sm mb-8">支持 JPG, PNG, WEBP 格式（最大 20MB），点击此处或拖拽文件</p>
        <span className="bg-white border border-gray-200 text-gray-600 px-8 py-2.5 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all inline-block">
          选择文件
        </span>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onSuccess?.();
        }}
      />
    </>
  );
}
