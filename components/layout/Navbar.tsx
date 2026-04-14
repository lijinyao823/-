'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Camera, Trophy, Hash, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import NavSearchBar from '@/components/layout/NavSearchBar';
import NavUserActions from '@/components/layout/NavUserActions';

/**
 * 合并 Tailwind 类名的工具函数
 */
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

  // 1. 监听用户认证状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 数据获取与实时监听
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadMessages(0);
      return;
    }

    /**
     * 获取未读私信数量 (基于 conversations -> messages 链路)
     */
    const fetchUnreadMessages = async () => {
      // 查询当前用户参与的所有会话
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);

      if (convError || !convs || convs.length === 0) {
        setUnreadMessages(0);
        return;
      }

      const convIds = convs.map((c: any) => c.id);

      // 统计这些会话中来自他人的未读消息数量
      const { count, error: msgError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .eq('read', false); // 匹配数据库 read 字段

      if (!msgError) setUnreadMessages(count ?? 0);
    };

    /**
     * 获取未读通知数量
     */
    const fetchUnreadNotifications = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false); // 匹配数据库 read 字段

      if (!error) setUnreadCount(count ?? 0);
    };

    // 执行初始获取
    fetchUnreadMessages();
    fetchUnreadNotifications();

    // 3. 建立实时订阅通道
    const channel = supabase.channel(`navbar-realtime-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        // 如果新消息不是自己发的且未读，增加计数
        if (payload.new.sender_id !== user.id && !payload.new.read) {
          setUnreadMessages(prev => prev + 1);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        // 消息状态更新（如标记已读）时重新拉取
        fetchUnreadMessages();
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        // 如果是给自己的新通知且未读，增加计数
        if (payload.new.user_id === user.id && !payload.new.read) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
              <Camera size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-600">理工光影</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={navLinkClass('/')}>
              首页
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full", pathname === '/' ? "w-full" : "w-0")} />
            </Link>
            <Link href="/leaderboard" className={navLinkClass('/leaderboard')}>
              <Trophy size={14} />
              排行榜
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full", pathname === '/leaderboard' ? "w-full" : "w-0")} />
            </Link>
            <Link href="/tags" className={navLinkClass('/tags')}>
              <Hash size={14} />
              标签
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full", pathname === '/tags' ? "w-full" : "w-0")} />
            </Link>
            <Link href="/photographers" className={navLinkClass('/photographers')}>
              <Users size={14} />
              摄影师
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full", pathname === '/photographers' ? "w-full" : "w-0")} />
            </Link>
            {user && (
              <Link href="/profile" className={navLinkClass('/profile')}>
                个人中心
                <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full", pathname === '/profile' ? "w-full" : "w-0")} />
              </Link>
            )}
          </div>

          {/* Actions Section */}
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