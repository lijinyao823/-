'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import ConversationHeader from '@/components/messages/ConversationHeader';
import MessageBubble from '@/components/messages/MessageBubble';
import MessageInput from '@/components/messages/MessageInput';

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
      const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
      if (conv) {
        const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
        const { data: profile } = await supabase.from('user_profiles').select('username, avatar_url').eq('user_id', otherId).maybeSingle();
        setOtherUser({ id: otherId, ...profile });
      }
      await loadMessages(userId);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(userId?: string) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    const uid = userId ?? currentUserRef.current?.id;
    if (uid) {
      await supabase.from('messages').update({ read: true }).eq('conversation_id', conversationId).neq('sender_id', uid).eq('read', false);
    }
  }

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    setSending(true);
    try {
      await supabase.from('messages').insert([{ conversation_id: conversationId, sender_id: currentUser.id, content: newMessage.trim(), read: false }]);
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
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
      <ConversationHeader otherUser={otherUser} onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isMe={msg.sender_id === currentUser?.id} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput value={newMessage} onChange={setNewMessage} onSubmit={handleSend} sending={sending} />
    </div>
  );
}
