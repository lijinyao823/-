'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Heart, UserPlus, UserCheck, Loader2, MessageSquare, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function UserListModal({ title, users, onClose }: { title: string; users: any[]; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">暂无数据</p>
          ) : users.map((u: any) => (
            <button
              key={u.user_id}
              onClick={() => { router.push(`/user/${u.user_id}`); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  (u.username || '?')[0]
                )}
              </div>
              <span className="text-sm font-bold text-gray-800">@{u.username || '摄影师'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ works: 0, likes: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followerUsers, setFollowerUsers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    if (userId) loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(profileData);

      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const photoList = photosData || [];
      setPhotos(photoList);

      const totalLikes = photoList.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);

      const { count: followersCount } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setStats({ works: photoList.length, likes: totalLikes, followers: followersCount || 0, following: followingCount || 0 });

      // Load follower/following user profiles
      const [{ data: followerData }, { data: followingData }] = await Promise.all([
        supabase.from('follows').select('follower_id').eq('following_id', userId),
        supabase.from('follows').select('following_id').eq('follower_id', userId),
      ]);

      if (followerData && followerData.length > 0) {
        const ids = followerData.map((f: any) => f.follower_id);
        const { data: profiles } = await supabase.from('user_profiles').select('user_id, username, avatar_url').in('user_id', ids);
        setFollowerUsers(profiles || []);
      }
      if (followingData && followingData.length > 0) {
        const ids = followingData.map((f: any) => f.following_id);
        const { data: profiles } = await supabase.from('user_profiles').select('user_id, username, avatar_url').in('user_id', ids);
        setFollowingUsers(profiles || []);
      }

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
    if (!currentUser) { router.push('/login'); return; }
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

  const handleSendMessage = async () => {
    if (!currentUser) { router.push('/login'); return; }
    if (currentUser.id === userId) return;

    // Find or create conversation
    const participantA = currentUser.id < userId ? currentUser.id : userId;
    const participantB = currentUser.id < userId ? userId : currentUser.id;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_a', participantA)
      .eq('participant_b', participantB)
      .maybeSingle();

    if (existing) {
      router.push(`/messages/${existing.id}`);
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert([{ participant_a: participantA, participant_b: participantB }])
        .select('id')
        .single();
      if (!error && newConv) {
        router.push(`/messages/${newConv.id}`);
      }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mt-4 mb-2 transition-colors font-bold"
        >
          <ArrowLeft size={18} />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-lg">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MessageSquare size={16} />
                  发私信
                </button>
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                >
                  {isFollowing ? <><UserCheck size={16} />已关注</> : <><UserPlus size={16} />关注</>}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
            {[
              { label: '作品', value: stats.works, onClick: undefined },
              { label: '获赞', value: stats.likes, onClick: undefined },
              { label: '粉丝', value: stats.followers, onClick: () => setShowModal('followers') },
              { label: '关注', value: stats.following, onClick: () => setShowModal('following') },
            ].map(s => (
              <div
                key={s.label}
                className={`text-center ${s.onClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                onClick={s.onClick}
              >
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

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
                  onClick={() => router.push(`/photo/${p.id}`)}
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

      {showModal === 'followers' && (
        <UserListModal
          title={`粉丝 (${stats.followers})`}
          users={followerUsers}
          onClose={() => setShowModal(null)}
        />
      )}
      {showModal === 'following' && (
        <UserListModal
          title={`关注 (${stats.following})`}
          users={followingUsers}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
}

