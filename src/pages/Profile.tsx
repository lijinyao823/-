import React from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import UploadZone from '../components/profile/UploadZone';
import UserWorksGrid from '../components/profile/UserWorksGrid';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* 左侧侧边栏 */}
          <ProfileSidebar />

          {/* 右侧主内容区 */}
          <div className="lg:col-span-3 space-y-8">
            <UploadZone />
            <UserWorksGrid />
          </div>
        </div>
      </div>
    </div>
  );
}