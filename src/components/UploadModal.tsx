import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 20;
const CATEGORIES = [
  { id: 'scenery', label: '风光' },
  { id: 'humanities', label: '人文' },
  { id: 'activity', label: '活动' },
];
const LOCATIONS = ['南湖校区', '马房山校区', '余家头校区', '其他'];

/** 只允许 blob: 和 https: 的 URL 用作 img src，防止 XSS */
function sanitizeImageSrc(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'blob:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // invalid URL
  }
  return '';
}

export default function UploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('scenery');
  const [location, setLocation] = useState('南湖校区');
  const [exifData, setExifData] = useState({ camera: '', iso: '', shutter: '', aperture: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const validateFile = (f: File): string => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `不支持的文件格式（${f.type}），请上传 JPG/PNG/WEBP/GIF/TIFF`;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `文件过大（${(f.size / 1024 / 1024).toFixed(1)}MB），最大允许 ${MAX_SIZE_MB}MB`;
    }
    return '';
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file || !title) { setError('请填写标题并选择照片'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. 上传到 Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // 2. 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();

      // 3. 插入数据库
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          title,
          description,
          category,
          location,
          image_url: publicUrl,
          user_id: user?.id,
          author_name: user?.email?.split('@')[0] || '匿名',
          exif: exifData,
          likes_count: 0,
          comments_count: 0,
        }]);

      if (dbError) throw dbError;

      // 重置
      setTitle(''); setDescription(''); setFile(null); setPreview(null);
      setCategory('scenery'); setLocation('南湖校区');
      setExifData({ camera: '', iso: '', shutter: '', aperture: '' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0">
          <h3 className="font-bold text-slate-800 text-lg">分享新光影</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* 标题 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">照片标题 *</label>
            <input type="text" placeholder="例如：南湖图书馆的黄昏"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">作品描述</label>
            <textarea placeholder="描述这张照片背后的故事..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* 分类 + 地点 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">分类</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">拍摄地点</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* EXIF 参数 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">相机参数（EXIF，选填）</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'camera', placeholder: '相机型号，如 Sony A7R IV' },
                { key: 'iso', placeholder: '感光度，如 ISO 400' },
                { key: 'shutter', placeholder: '快门速度，如 1/200s' },
                { key: 'aperture', placeholder: '光圈，如 f/2.8' },
              ].map(({ key, placeholder }) => (
                <input key={key} placeholder={placeholder}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={(exifData as any)[key]}
                  onChange={(e) => setExifData(prev => ({ ...prev, [key]: e.target.value }))} />
              ))}
            </div>
          </div>

          {/* 图片上传区 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">选择照片 * <span className="text-gray-400 font-normal text-xs">（JPG/PNG/WEBP，最大 {MAX_SIZE_MB}MB）</span></label>
            <label
              className={`group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={sanitizeImageSrc(preview)} alt="预览" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload size={32} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-sm">点击上传或拖拽文件到此处</span>
                  <span className="text-xs mt-1">支持 JPG, PNG, WEBP</span>
                </div>
              )}
              <input type="file" accept={ALLOWED_TYPES.join(',')} className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} />上传中...</> : '立即发布作品'}
          </button>
        </div>
      </div>
    </div>
  );
}
