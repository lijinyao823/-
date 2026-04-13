import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Search, User, PlusCircle, LogOut, Trophy, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 获取未读通知数
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 左侧：Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
              <Camera size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-600">理工光影</span>
          </Link>

          {/* 中间：导航菜单 */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) => cn(
                "relative py-2 text-sm font-medium transition-all duration-300 group",
                isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              )}
            >
              首页
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) => cn(
                "relative py-2 text-sm font-medium transition-all duration-300 group flex items-center gap-1",
                isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              )}
            >
              <Trophy size={14} />
              排行榜
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </NavLink>

            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) => cn(
                  "relative py-2 text-sm font-medium transition-all duration-300 group",
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                )}
              >
                个人中心
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </NavLink>
            )}
          </div>

          {/* 右侧：搜索、上传与用户入口 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="探索校园光影..."
                className="pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-full text-sm
                           focus:ring-2 focus:ring-blue-600/20 focus:bg-white focus:w-80
                           w-48 lg:w-64 transition-all duration-500 ease-out outline-none"
              />
            </form>

            {user ? (
              <>
                {/* 通知铃铛 */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                    title="通知"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      userId={user.id}
                      onClose={() => setShowNotifications(false)}
                      onRead={() => setUnreadCount(0)}
                    />
                  )}
                </div>

                <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
                  onClick={() => navigate('/profile')}>
                  <PlusCircle size={16} />
                  <span>上传</span>
                </button>

                <div className="flex items-center gap-2 ml-2">
                  <Link to="/profile" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <User size={22} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="退出登录"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
              >
                登录 / 注册
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
