'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UserListModal from '@/components/modals/UserListModal';
import UserProfileCard from '@/components/profile/UserProfileCard';
import UserPhotosGrid from '@/components/profile/UserPhotosGrid';

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
      const { data: profileData } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle();
      setProfile(profileData);

      const { data: photosData } = await supabase.from('photos').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const photoList = photosData || [];
      setPhotos(photoList);

      const totalLikes = photoList.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);
      const { count: followersCount } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId);
      const { count: followingCount } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId);
      setStats({ works: photoList.length, likes: totalLikes, followers: followersCount || 0, following: followingCount || 0 });

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
        const { data: followData } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle();
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
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
      setIsFollowing(false);
      setStats(s => ({ ...s, followers: s.followers - 1 }));
    } else {
      await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: userId }]);
      setIsFollowing(true);
      setStats(s => ({ ...s, followers: s.followers + 1 }));
      try {
        await supabase.from('notifications').insert([{ user_id: userId, type: 'follow', actor_name: currentUser.email?.split('@')[0] || '某用户' }]);
      } catch {}
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) { router.push('/login'); return; }
    if (currentUser.id === userId) return;
    const participantA = currentUser.id < userId ? currentUser.id : userId;
    const participantB = currentUser.id < userId ? userId : currentUser.id;
    const { data: existing } = await supabase.from('conversations').select('id').eq('participant_a', participantA).eq('participant_b', participantB).maybeSingle();
    if (existing) {
      router.push(`/messages/${existing.id}`);
    } else {
      const { data: newConv, error } = await supabase.from('conversations').insert([{ participant_a: participantA, participant_b: participantB }]).select('id').single();
      if (!error && newConv) router.push(`/messages/${newConv.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mt-4 mb-2 transition-colors font-bold">
          <ArrowLeft size={18} />
          返回
        </button>

        <UserProfileCard
          profile={profile}
          stats={stats}
          isFollowing={isFollowing}
          isSelf={currentUser?.id === userId}
          onFollow={handleFollow}
          onMessage={handleSendMessage}
          onShowModal={setShowModal}
        />

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-blue-600" />
            作品 ({photos.length})
          </h3>
          <UserPhotosGrid photos={photos} />
        </div>
      </div>

      {showModal === 'followers' && (
        <UserListModal title={`粉丝 (${stats.followers})`} users={followerUsers} onClose={() => setShowModal(null)} />
      )}
      {showModal === 'following' && (
        <UserListModal title={`关注 (${stats.following})`} users={followingUsers} onClose={() => setShowModal(null)} />
      )}
    </div>
  );
}
