'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, AlertCircle } from 'lucide-react';
import DropZone from '@/components/modals/upload/DropZone';
import FileListItem, { FileEntry } from '@/components/modals/upload/FileListItem';
import ExifFieldsForm, { ExifData } from '@/components/modals/upload/ExifFieldsForm';
import TagInput from '@/components/ui/TagInput';

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

export default function UploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('scenery');
  const [location, setLocation] = useState('南湖校区');
  const [exifData, setExifData] = useState<ExifData>({ camera: '', iso: '', shutter: '', aperture: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setDescription('');
    setCategory('scenery');
    setLocation('南湖校区');
    setExifData({ camera: '', iso: '', shutter: '', aperture: '' });
    setTags([]);
    setError('');
    onClose();
  };

  const validateFile = (f: File): string => {
    if (!ALLOWED_TYPES.includes(f.type)) return `不支持的文件格式（${f.type}），请上传 JPG/PNG/WEBP`;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `文件过大（${(f.size / 1024 / 1024).toFixed(1)}MB），最大允许 ${MAX_SIZE_MB}MB`;
    return '';
  };

  const addFiles = (newFiles: File[]) => {
    setError('');
    const entries: FileEntry[] = [];
    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) { setError(err); continue; }
      entries.push({ file: f, title: f.name.replace(/\.[^.]+$/, ''), preview: URL.createObjectURL(f), status: 'waiting' });
    }
    setFiles(prev => [...prev, ...entries]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, title: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, title } : f));
  };

  const uploadSingleFile = async (entry: FileEntry): Promise<string | null> => {
    const fileExt = entry.file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, entry.file, { contentType: entry.file.type });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleUpload = async () => {
    if (files.length === 0) { setError('请选择至少一张照片'); return; }
    if (files.some(f => !f.title.trim())) { setError('请为每张照片填写标题'); return; }
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
            .insert([{ title: entry.title, description, category, location, image_url: publicUrl, user_id: user?.id, author_name: user?.email?.split('@')[0] || '匿名', exif: exifData, likes_count: 0, comments_count: 0 }])
            .select('id').single();
          if (dbError) throw dbError;
          if (tags.length > 0 && photoData) {
            for (const tagName of tags) {
              try {
                const { data: tagData } = await supabase.from('tags').upsert([{ name: tagName }], { onConflict: 'name' }).select('id').single();
                if (tagData) await supabase.from('photo_tags').insert([{ photo_id: photoData.id, tag_id: tagData.id }]);
              } catch {}
            }
          }
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
        } catch (err: any) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message } : f));
        }
      }
      files.forEach(f => URL.revokeObjectURL(f.preview));
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 sticky top-0">
          <h3 className="font-bold text-slate-800 text-lg">分享新光影</h3>
          <button onClick={handleClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">作品描述</label>
            <textarea placeholder="描述这张照片背后的故事..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

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

          <TagInput tags={tags} onChange={setTags} />

          <ExifFieldsForm value={exifData} onChange={setExifData} />

          <DropZone
            onFiles={addFiles}
            isDragging={isDragging}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            allowedTypes={ALLOWED_TYPES}
            maxSizeMB={MAX_SIZE_MB}
          />

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">已选 {files.length} 张照片</p>
              {files.map((entry, i) => (
                <FileListItem key={i} entry={entry} index={i} onRemove={removeFile} onTitleChange={updateTitle} />
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
