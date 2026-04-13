'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types';
import CommentItem from '@/components/detail/CommentItem';
import CommentForm from '@/components/detail/CommentForm';

interface Props {
  photoId: string;
  photoTitle?: string;
}

export default function CommentSection({ photoId, photoTitle = '' }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    loadComments();
    const channel = supabase.channel(`comments:${photoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `photo_id=eq.${photoId}` }, () => loadComments())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments', filter: `photo_id=eq.${photoId}` }, () => loadComments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [photoId]);

  async function loadComments() {
    const { data } = await supabase.from('comments').select('*').eq('photo_id', photoId).order('created_at', { ascending: true });
    const all = (data || []) as Comment[];
    const topLevel = all.filter(c => !c.parent_id);
    topLevel.forEach(c => { c.replies = all.filter(r => r.parent_id === c.id); });
    setComments(topLevel);
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) { alert('请先登录后再评论'); return; }
    setLoading(true);
    const insertPayload: any = { photo_id: photoId, user_id: currentUser.id, author: currentUser.email?.split('@')[0] || '匿名用户', content: newComment.trim(), parent_id: replyTo?.id ?? null };
    const { error } = await supabase.from('comments').insert([insertPayload]);
    if (!error) {
      try { await supabase.rpc('increment_comments_count', { photo_id: photoId }); } catch {}
      if (replyTo) {
        const allComments = comments.flatMap(c => [c, ...(c.replies || [])]);
        const target = allComments.find(c => c.id === replyTo.id);
        if (target && target.user_id !== currentUser.id) {
          try {
            await supabase.from('notifications').insert([{ user_id: target.user_id, type: 'comment', actor_name: insertPayload.author, photo_id: photoId, photo_title: photoTitle }]);
          } catch {}
        }
      }
      setNewComment('');
      setReplyTo(null);
      await loadComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return;
    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', currentUser.id);
    await loadComments();
  };

  const allCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-8">评论 ({allCount})</h3>

      <CommentForm
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleAddComment}
        loading={loading}
        currentUser={currentUser}
      />

      <div className="space-y-8">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <CommentItem comment={c} currentUserId={currentUser?.id} onReply={(id, author) => setReplyTo({ id, author })} onDelete={handleDelete} />
              {c.replies && c.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                  {c.replies.map(r => (
                    <CommentItem key={r.id} comment={r} currentUserId={currentUser?.id} onReply={(id, author) => setReplyTo({ id, author })} onDelete={handleDelete} isReply={true} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
