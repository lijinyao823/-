import React from 'react';
import { Info } from 'lucide-react';

export default function PhotoInfoSidebar({ photo }: { photo: any }) {
  const exifItems = [
    { label: '相机', value: photo.exif.camera },
    { label: '感光度', value: `ISO ${photo.exif.iso}` },
    { label: '快门', value: photo.exif.shutter },
    { label: '光圈', value: photo.exif.aperture },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{photo.title}</h2>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">{photo.author[0]}</div>
          <div>
            <p className="font-bold text-gray-900">{photo.author}</p>
            <p className="text-[10px] text-gray-400">发布于 2024-03-20</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">{photo.description}</p>
        
        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-900 font-bold mb-6">
            <Info size={18} className="text-blue-600" />
            <span>参数 (EXIF)</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {exifItems.map(item => (
              <div key={item.label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 p-8 rounded-2xl shadow-lg text-white">
        <h4 className="font-bold mb-2 italic">© Copyright</h4>
        <p className="text-[10px] text-blue-100 leading-relaxed">
          作品版权归作者所有。未经授权，禁止任何形式的商业用途及二次创作。
        </p>
      </div>
    </div>
  );
}