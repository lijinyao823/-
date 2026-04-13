'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TagInput from '@/components/ui/TagInput';
import CategorySelector from '@/components/ui/CategorySelector';

interface Props {
  photo: any;
  onClose: () => void;
  onSaved: (updated: any) => void;
}

const CATEGORIES = [
  { value: 'scenery', label: '风光' },
  { value: 'humanities', label: '人文' },
  { value: 'activity', label: '活动' },
];

export default function EditPhotoModal({ photo, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(photo.title || '');
  const [description, setDescription] = useState(photo.description || '');
  const [category, setCategory] = useState(photo.category || 'scenery');
  const [location, setLocation] = useState(photo.location || '');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTags() {
      const { data } = await supabase.from('photo_tags').select('tags(name)').eq('photo_id', photo.id);
      if (data) setTags(data.map((pt: any) => pt.tags?.name).filter(Boolean));
    }
    if (photo.id) loadTags();
  }, [photo.id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data: updated, error } = await supabase
        .from('photos')
        .update({ title: title.trim(), description: description.trim(), category, location: location.trim() || null })
        .eq('id', photo.id)
        .select('*')
        .single();
      if (error) throw error;

      await supabase.from('photo_tags').delete().eq('photo_id', photo.id);
      if (tags.length > 0) {
        const { data: tagRows } = await supabase.from('tags').upsert(tags.map(name => ({ name })), { onConflict: 'name' }).select('id, name');
        if (tagRows && tagRows.length > 0) {
          await supabase.from('photo_tags').insert(tagRows.map((tr: any) => ({ photo_id: photo.id, tag_id: tr.id })));
        }
      }

      onSaved(updated);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">编辑照片信息</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="照片标题"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="照片描述（可选）"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">分类</label>
            <CategorySelector value={category} onChange={setCategory} categories={CATEGORIES} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">拍摄地点</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="如：南湖校区"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">标签</label>
            <TagInput tags={tags} onChange={setTags} placeholder="输入标签后按回车" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            保存修改
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
