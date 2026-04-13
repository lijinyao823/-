'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Camera, Trophy, Hash, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import NavSearchBar from '@/components/layout/NavSearchBar';
import NavUserActions from '@/components/layout/NavUserActions';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
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
      supabase.from('conversations').select('id').or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .then(({ data: convs }) => {
          if (!convs || convs.length === 0) { setUnreadMessages(0); return; }
          const convIds = convs.map((c: any) => c.id);
          supabase.from('messages').select('id', { count: 'exact', head: true }).in('conversation_id', convIds).neq('sender_id', user.id).eq('read', false)
            .then(({ count }) => setUnreadMessages(count ?? 0));
        });

    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    fetchUnreadMessages();

    const channel = supabase.channel(`navbar-messages-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id !== user.id && !payload.new.read) setUnreadMessages(n => n + 1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => { fetchUnreadMessages(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new.user_id === user.id && !payload.new.read) setUnreadCount(n => n + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
            <NavSearchBar defaultValue={searchParams?.get('q') || ''} />
            {user ? (
              <NavUserActions
                user={user}
                unreadCount={unreadCount}
                unreadMessages={unreadMessages}
                onLogout={handleLogout}
                onUnreadCountChange={setUnreadCount}
              />
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95">
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
