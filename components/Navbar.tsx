'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Camera, Search, User, PlusCircle, LogOut, Trophy, Bell, MessageSquare, Hash, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import NotificationDropdown from '@/components/NotificationDropdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setUnreadCount(0); setUnreadMessages(0); return; }

    const fetchUnreadMessages = () =>
      supabase
        .from('conversations')
        .select('id')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .then(({ data: convs }) => {
          if (!convs || convs.length === 0) { setUnreadMessages(0); return; }
          const convIds = convs.map((c: any) => c.id);
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .neq('sender_id', user.id)
            .eq('read', false)
            .then(({ count }) => setUnreadMessages(count ?? 0));
        });

    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    fetchUnreadMessages();

    const channel = supabase
      .channel(`navbar-messages-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== user.id && !payload.new.read) {
            setUnreadMessages(n => n + 1);
          }
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => { fetchUnreadMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  const navLinkClass = (href: string) => cn(
    "relative py-2 text-sm font-medium transition-all duration-300 group flex items-center gap-1",
    pathname === href ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
  );

  return (
    <nav className="glass-nav sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
              <Camera size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-600">理工光影</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={navLinkClass('/')}>
              首页
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link href="/leaderboard" className={navLinkClass('/leaderboard')}>
              <Trophy size={14} />
              排行榜
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link href="/tags" className={navLinkClass('/tags')}>
              <Hash size={14} />
              标签
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link href="/photographers" className={navLinkClass('/photographers')}>
              <Users size={14} />
              摄影师
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>

            {user && (
              <Link href="/profile" className={navLinkClass('/profile')}>
                个人中心
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
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
                {/* Notification bell */}
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

                {/* Messages icon */}
                <Link href="/messages" className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative" title="私信">
                  <MessageSquare size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>

                <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
                  onClick={() => router.push('/profile')}>
                  <PlusCircle size={16} />
                  <span>上传</span>
                </button>

                <div className="flex items-center gap-2 ml-2">
                  <Link href="/profile" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
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
                href="/login"
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

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="glass-nav sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16" />
    }>
      <NavbarContent />
    </Suspense>
  );
}
