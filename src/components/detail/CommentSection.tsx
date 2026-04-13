import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, CornerDownRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Comment } from '../../types';

interface Props {
  photoId: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return date.toLocaleDateString('zh-CN');
}

export default function CommentSection({ photoId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    loadComments();

    // Realtime 订阅
    const channel = supabase
      .channel(`comments:${photoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `photo_id=eq.${photoId}` },
        () => loadComments())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments', filter: `photo_id=eq.${photoId}` },
        () => loadComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [photoId]);

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: true });

    // 组织嵌套结构
    const all = (data || []) as Comment[];
    const topLevel = all.filter(c => !c.parent_id);
    topLevel.forEach(c => {
      c.replies = all.filter(r => r.parent_id === c.id);
    });
    setComments(topLevel);
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) { alert('请先登录后再评论'); return; }
    setLoading(true);

    // 更新照片的评论数
    const insertPayload: any = {
      photo_id: photoId,
      user_id: currentUser.id,
      author: currentUser.email?.split('@')[0] || '匿名用户',
      content: newComment.trim(),
      parent_id: replyTo?.id ?? null,
    };

    const { error } = await supabase.from('comments').insert([insertPayload]);
    if (!error) {
      // 更新评论计数（忽略错误，如函数不存在则跳过）
      try { await supabase.rpc('increment_comments_count', { photo_id: photoId }); } catch {}

      // 发送通知（如果回复别人）
      if (replyTo) {
        const allComments = comments.flatMap(c => [c, ...(c.replies || [])]);
        const target = allComments.find(c => c.id === replyTo.id);
        if (target && target.user_id !== currentUser.id) {
          try {
            await supabase.from('notifications').insert([{
              user_id: target.user_id,
              type: 'comment',
              actor_name: insertPayload.author,
              photo_id: photoId,
            }]);
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

      {/* 评论框 */}
      <form onSubmit={handleAddComment} className="mb-10">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
            <CornerDownRight size={12} />
            回复 @{replyTo.author}
            <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="flex gap-4">
          <input
            type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentUser ? (replyTo ? `回复 @${replyTo.author}...` : '分享你的见解...') : '登录后参与评论'}
            disabled={!currentUser}
            className="flex-1 bg-gray-50 border-none rounded-xl px-6 py-3 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          />
          <button type="submit" disabled={loading || !currentUser}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg transition-transform active:scale-95 disabled:opacity-50">
            <Send size={20} />
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-8">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <CommentItem
                comment={c}
                currentUserId={currentUser?.id}
                onReply={(id: string, author: string) => setReplyTo({ id, author })}
                onDelete={handleDelete}
              />
              {/* 回复列表 */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                  {c.replies.map(r => (
                    <CommentItem
                      key={r.id}
                      comment={r}
                      currentUserId={currentUser?.id}
                      onReply={(id: string, author: string) => setReplyTo({ id, author })}
                      onDelete={handleDelete}
                      isReply={true}
                    />
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

interface CommentItemProps {
  comment: any;
  currentUserId?: any;
  onReply: (id: string, author: string) => any;
  onDelete: (id: string) => any;
  isReply?: boolean;
  [key: string]: any;
}

function CommentItem({ comment, currentUserId, onReply, onDelete, isReply = false }: CommentItemProps) {
  return (
    <div className="flex gap-4">
      <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0`}>
        {comment.author[0]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm text-gray-900">{comment.author}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{formatTime(comment.created_at)}</span>
            {currentUserId && (
              <button
                onClick={() => onReply(comment.id, comment.author)}
                className="text-[10px] text-gray-400 hover:text-blue-600"
              >
                回复
              </button>
            )}
            {currentUserId === comment.user_id && (
              <button onClick={() => onDelete(comment.id)} className="text-[10px] text-gray-400 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
