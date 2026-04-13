import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import EditProfileModal from './EditProfileModal';

export default function ProfileHeader() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ works: 0, likes: 0, followers: 0 });
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadData(user.id);
    });
  }, []);

  async function loadData(userId: string) {
    // 获取 profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(profileData);

    // 统计
    const { data: photos } = await supabase
      .from('photos')
      .select('likes_count')
      .eq('user_id', userId);
    const photoList = photos || [];
    const totalLikes = photoList.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
    const { count: followersCount } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);
    setStats({ works: photoList.length, likes: totalLikes, followers: followersCount || 0 });
  }

  const displayName = profile?.username || user?.email?.split('@')[0] || '武理摄影君';
  const bio = profile?.bio || '武汉理工大学 | 喜欢捕捉校园里的每一个光影瞬间。';
  const avatarUrl = profile?.avatar_url;

  return (
    <>
      <div className="bg-white border-b border-gray-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* 头像 */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName[0]
                )}
              </div>
              <button
                onClick={() => setShowEdit(true)}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>

            {/* 资料 */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayName}</h1>
              {(profile?.college || profile?.grade) && (
                <p className="text-sm text-blue-600 mb-1">{profile.college} {profile.grade}</p>
              )}
              <p className="text-gray-500 mb-6 max-w-md text-sm">{bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-8">
                {[
                  { label: '作品', value: stats.works },
                  { label: '获赞', value: stats.likes },
                  { label: '粉丝', value: stats.followers },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Settings size={18} />
              <span>编辑资料</span>
            </button>
          </div>
        </div>
      </div>

      {showEdit && user && (
        <EditProfileModal
          profile={profile}
          userId={user.id}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => { setProfile(updated); setShowEdit(false); }}
        />
      )}
    </>
  );
}
