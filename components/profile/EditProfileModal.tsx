'use client';

import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  profile: any;
  userId: string;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

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

export default function EditProfileModal({ profile, userId, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [university, setUniversity] = useState(profile?.university || ''); // 适配数据库字段 university
  const [grade, setGrade] = useState(profile?.grade || '');               // 适配新增字段 grade
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('头像图片不超过 5MB'); return; }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!username.trim()) { setError('昵称不能为空'); return; }
    setLoading(true);
    setError('');

    try {
      let avatarUrl = profile?.avatar_url || null;

      // 1. 如果选择了新头像，先执行上传
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'jpg';
        const path = `avatars/${userId}.${ext}`;
        // 使用 upsert: true 覆盖旧头像
        const { error: uploadErr } = await supabase.storage
          .from('gallery')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        
        if (uploadErr) throw uploadErr;
        
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      // 2. 准备适配数据库字段的更新对象
      const updates = {
        id: userId,               // 适配数据库主键 id
        username: username,
        full_name: username,      // 同步更新 full_name 保持一致
        bio: bio,
        university: university,   // 适配数据库字段 university
        grade: grade,             // 适配你刚刚新增的字段 grade
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      // 3. 执行 Upsert 操作 (存在即更新，不存在即插入)
      const { data, error: upsertErr } = await supabase
        .from('user_profiles')
        .upsert(updates, { onConflict: 'id' })
        .select()
        .single();

      if (upsertErr) throw upsertErr;

      // 4. 通知父组件成功并关闭
      onSuccess(data);
      onClose();
    } catch (err: any) {
      console.error('Save error details:', err);
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">编辑个人资料</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {/* 头像预览与更换 */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-2 border-slate-100">
              {avatarPreview ? (
                <img src={sanitizeImageSrc(avatarPreview)} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                username[0] || '?'
              )}
            </div>
            <label className="text-sm text-blue-600 font-medium cursor-pointer hover:text-blue-700 hover:underline">
              更换头像
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* 昵称输入 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">昵称 *</label>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="你的展示名称"
            />
          </div>

          {/* 简介输入 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">个人简介</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              placeholder="介绍一下自己，比如擅长的摄影风格..." 
            />
          </div>

          {/* 学院与年级 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">所在学院</label>
              <input 
                value={university} 
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="如：艺术设计学院"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">年级</label>
              <input 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                placeholder="如：2024级"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" 
              />
            </div>
          </div>

          {/* 保存按钮 */}
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} />保存中...</>
            ) : (
              '保存更改'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}