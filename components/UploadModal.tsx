'use client';

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, AlertCircle, Tag as TagIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FileEntry {
  file: File;
  title: string;
  preview: string;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 20;
const CATEGORIES = [
  { id: 'scenery', label: '风光' },
  { id: 'humanities', label: '人文' },
  { id: 'activity', label: '活动' },
];
const LOCATIONS = ['南湖校区', '马房山校区', '余家头校区', '其他'];

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
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('scenery');
  const [location, setLocation] = useState('南湖校区');
  const [exifData, setExifData] = useState({ camera: '', iso: '', shutter: '', aperture: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const validateFile = (f: File): string => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `不支持的文件格式（${f.type}），请上传 JPG/PNG/WEBP`;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `文件过大（${(f.size / 1024 / 1024).toFixed(1)}MB），最大允许 ${MAX_SIZE_MB}MB`;
    }
    return '';
  };

  const addFiles = (newFiles: File[]) => {
    setError('');
    const entries: FileEntry[] = [];
    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) { setError(err); continue; }
      entries.push({
        file: f,
        title: f.name.replace(/\.[^.]+$/, ''),
        preview: URL.createObjectURL(f),
        status: 'waiting',
      });
    }
    setFiles(prev => [...prev, ...entries]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) addFiles(selected);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) addFiles(dropped);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, title: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, title } : f));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const uploadSingleFile = async (entry: FileEntry): Promise<string | null> => {
    const fileExt = entry.file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, entry.file, { contentType: entry.file.type });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (files.length === 0) { setError('请选择至少一张照片'); return; }
    const invalidTitles = files.filter(f => !f.title.trim());
    if (invalidTitles.length > 0) { setError('请为每张照片填写标题'); return; }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

        try {
          const publicUrl = await uploadSingleFile(entry);

          const { data: photoData, error: dbError } = await supabase
            .from('photos')
            .insert([{
              title: entry.title,
              description,
              category,
              location,
              image_url: publicUrl,
              user_id: user?.id,
              author_name: user?.email?.split('@')[0] || '匿名',
              exif: exifData,
              likes_count: 0,
              comments_count: 0,
            }])
            .select('id')
            .single();

          if (dbError) throw dbError;

          // Handle tags
          if (tags.length > 0 && photoData) {
            for (const tagName of tags) {
              try {
                const { data: tagData } = await supabase
                  .from('tags')
                  .upsert([{ name: tagName }], { onConflict: 'name' })
                  .select('id')
                  .single();
                if (tagData) {
                  await supabase.from('photo_tags').insert([{
                    photo_id: photoData.id,
                    tag_id: tagData.id,
                  }]);
                }
              } catch {}
            }
          }

          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
        } catch (err: any) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message } : f));
        }
      }

      // Reset
      setFiles([]);
      setDescription('');
      setCategory('scenery');
      setLocation('南湖校区');
      setExifData({ camera: '', iso: '', shutter: '', aperture: '' });
      setTags([]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: FileEntry['status']) => {
    switch (status) {
      case 'waiting': return 'text-gray-400';
      case 'uploading': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
    }
  };

  const statusLabel = (status: FileEntry['status']) => {
    switch (status) {
      case 'waiting': return '等待';
      case 'uploading': return '上传中';
      case 'success': return '成功';
      case 'error': return '失败';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0">
          <h3 className="font-bold text-slate-800 text-lg">分享新光影</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">作品描述</label>
            <textarea placeholder="描述这张照片背后的故事..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Category + Location */}
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

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
              <TagIcon size={14} /> 标签（用空格、逗号或回车分隔）
            </label>
            <div className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap gap-2 min-h-[48px]">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                placeholder={tags.length === 0 ? '添加标签...' : ''}
                className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* EXIF */}
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

          {/* File drop zone */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              选择照片 * <span className="text-gray-400 font-normal text-xs">（JPG/PNG/WEBP，最大 {MAX_SIZE_MB}MB，支持多选）</span>
            </label>
            <label
              className={`group relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center text-slate-400">
                <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-sm">点击上传或拖拽文件到此处（可多选）</span>
                <span className="text-xs mt-1">支持 JPG, PNG, WEBP</span>
              </div>
              <input type="file" accept={ALLOWED_TYPES.join(',')} multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">已选 {files.length} 张照片</p>
              {files.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={sanitizeImageSrc(entry.preview)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => updateTitle(i, e.target.value)}
                      placeholder="照片标题（必填）*"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className={`text-xs mt-1 font-medium ${statusColor(entry.status)}`}>
                      {statusLabel(entry.status)}
                      {entry.error && ` - ${entry.error}`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} />上传中...</> : `立即发布 ${files.length > 0 ? `(${files.length}张)` : '作品'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
