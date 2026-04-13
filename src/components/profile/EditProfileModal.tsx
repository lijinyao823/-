import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  profile: any;
  userId: string;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

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

interface Props {
  profile: any;
  userId: string;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export default function EditProfileModal({ profile, userId, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [grade, setGrade] = useState(profile?.grade || '');
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

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'jpg';
        const path = `avatars/${userId}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('gallery')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      const updates = { user_id: userId, username, bio, college, grade, avatar_url: avatarUrl };
      const { data, error: upsertErr } = await supabase
        .from('user_profiles')
        .upsert([updates], { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertErr) throw upsertErr;
      onSuccess(data);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">编辑个人资料</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {/* 头像 */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {avatarPreview ? (
                <img src={sanitizeImageSrc(avatarPreview)} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                username[0] || '?'
              )}
            </div>
            <label className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">
              更换头像
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">昵称 *</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">个人简介</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="介绍一下自己..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">所在学院</label>
              <input value={college} onChange={(e) => setCollege(e.target.value)}
                placeholder="如：艺术设计学院"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">年级</label>
              <input value={grade} onChange={(e) => setGrade(e.target.value)}
                placeholder="如：22级"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} />保存中...</> : '保存更改'}
          </button>
        </div>
      </div>
    </div>
  );
}
