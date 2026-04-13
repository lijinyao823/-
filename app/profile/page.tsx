'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import UploadZone from '@/components/profile/UploadZone';
import UserWorksGrid from '@/components/profile/UserWorksGrid';

export default function Profile() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleUploadSuccess = useCallback(() => setRefreshKey(k => k + 1), []);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <ProfileSidebar />

          <div className="lg:col-span-3 space-y-8">
            <UploadZone onSuccess={handleUploadSuccess} />
            <UserWorksGrid key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
