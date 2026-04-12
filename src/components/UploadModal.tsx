import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 处理图片选择和预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return alert('请填写标题并选择照片');
    setLoading(true);

    try {
      // 1. 上传到 gallery 存储桶
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`; // 存放在 uploads 文件夹下

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 获取文件的公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // 3. 将记录插入 photos 数据库表
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          title: title,
          image_url: publicUrl, // 确保你数据库字段叫 image_url
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (dbError) throw dbError;

      alert('发布成功！');
      onSuccess(); // 触发父组件刷新
      onClose();   // 关闭弹窗
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">分享新光影</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">照片标题</label>
            <input 
              type="text" 
              placeholder="例如：南湖图书馆的黄昏" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-2">选择照片</label>
            <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden">
              {preview ? (
                <img src={preview} alt="预览" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload size={32} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-sm">点击上传高清原片</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button 
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : '立即发布作品'}
          </button>
        </div>
      </div>
    </div>
  );
}