'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }
      setCurrentUser(session.user);
      loadConversations(session.user.id);
    });
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel(`messages-list-${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { loadConversations(currentUser.id); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => { loadConversations(currentUser.id); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  async function loadConversations(userId: string) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (!data) { setConversations([]); return; }

      // Load profile info for other participant
      const enriched = await Promise.all(
        data.map(async (conv: any) => {
          const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username, avatar_url')
            .eq('user_id', otherId)
            .maybeSingle();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            otherUserId: otherId,
            otherUsername: profile?.username || '摄影师',
            otherAvatar: profile?.avatar_url,
            lastMessage: lastMsg?.content || '',
            lastMessageAt: lastMsg?.created_at || conv.last_message_at,
          };
        })
      );

      setConversations(enriched);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-600" />
          私信
        </h1>

        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 italic py-20">暂无私信</p>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0 overflow-hidden">
                  {conv.otherAvatar ? (
                    <img src={conv.otherAvatar} alt={conv.otherUsername} className="w-full h-full object-cover" />
                  ) : (
                    conv.otherUsername[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{conv.otherUsername}</p>
                  <p className="text-sm text-gray-400 truncate">{conv.lastMessage || '点击开始对话'}</p>
                </div>
                {conv.lastMessageAt && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(conv.lastMessageAt).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
