'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, ArrowLeft } from 'lucide-react';

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const currentUserRef = useRef<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setCurrentUser(session.user);
      currentUserRef.current = session.user;
      loadData(session.user.id);
    });
  }, [router, conversationId]);

  async function loadData(userId: string) {
    setLoading(true);
    try {
      // Get conversation info
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conv) {
        const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('user_id', otherId)
          .maybeSingle();
        setOtherUser({ id: otherId, ...profile });
      }

      await loadMessages(userId);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(userId?: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Mark messages from the other user as read
    const uid = userId ?? currentUserRef.current?.id;
    if (uid) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', uid)
        .eq('read', false);
    }
  }

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    setSending(true);
    try {
      await supabase.from('messages').insert([{
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        read: false,
      }]);
      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-16 z-10">
        <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-blue-600">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            (otherUser?.username || '?')[0]
          )}
        </div>
        <span className="font-bold text-gray-900">{otherUser?.username || '摄影师'}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Send form */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
