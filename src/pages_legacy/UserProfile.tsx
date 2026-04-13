import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ works: 0, likes: 0, followers: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    if (userId) loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);
    try {
      // 获取用户 profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(profileData);

      // 获取该用户的所有作品
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const photoList = photosData || [];
      setPhotos(photoList);

      // 统计
      const totalLikes = photoList.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);
      const { count: followersCount } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);
      setStats({ works: photoList.length, likes: totalLikes, followers: followersCount || 0 });

      // 检查当前用户是否关注
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();
        setIsFollowing(!!followData);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFollow = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (currentUser.id === userId) return;

    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);
      setIsFollowing(false);
      setStats(s => ({ ...s, followers: s.followers - 1 }));
    } else {
      await supabase.from('follows').insert([{
        follower_id: currentUser.id,
        following_id: userId,
      }]);
      setIsFollowing(true);
      setStats(s => ({ ...s, followers: s.followers + 1 }));
      const actorName = currentUser.email?.split('@')[0] || '某用户';
      try {
        await supabase.from('notifications').insert([{
          user_id: userId,
          type: 'follow',
          actor_name: actorName,
        }]);
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
      </div>
    );
  }

  const displayName = profile?.username || '摄影师';
  const bio = profile?.bio || '这位摄影师还没有填写个人简介';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 封面 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mt-4 mb-2 transition-colors font-bold"
        >
          <ArrowLeft size={18} />
          返回
        </button>

        {/* 头像与信息 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-lg -mt-16 md:-mt-0 md:relative md:top-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0]
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {profile?.college && (
                <p className="text-sm text-gray-500">{profile.college} · {profile.grade}</p>
              )}
              <p className="text-sm text-gray-600 mt-2 max-w-lg">{bio}</p>
            </div>
            {currentUser?.id !== userId && (
              <button
                onClick={handleFollow}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                {isFollowing ? <><UserCheck size={16} />已关注</> : <><UserPlus size={16} />关注</>}
              </button>
            )}
          </div>

          {/* 统计 */}
          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
            {[
              { label: '作品', value: stats.works },
              { label: '获赞', value: stats.likes },
              { label: '粉丝', value: stats.followers },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 作品网格 */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-blue-600" />
            作品 ({photos.length})
          </h3>
          {photos.length === 0 ? (
            <p className="text-center py-16 text-gray-400 italic">这位摄影师还没有发布作品</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/photo/${p.id}`)}
                  className="cursor-pointer group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={p.image_url || p.url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-gray-400">
                      <Heart size={10} />
                      <span className="text-xs">{p.likes_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
