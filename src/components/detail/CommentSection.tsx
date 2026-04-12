import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send } from 'lucide-react';

export default function CommentSection() {
  const [comments, setComments] = useState([
    { id: 'c1', author: '校友A', content: '构图太赞了！', timestamp: '2小时前' },
    { id: 'c2', author: '摄影爱好者', content: '光影处理得很细腻。', timestamp: '5小时前' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([{ id: Date.now().toString(), author: '我', content: newComment, timestamp: '刚刚' }, ...comments]);
    setNewComment('');
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-8">评论 ({comments.length})</h3>
      <form onSubmit={handleAddComment} className="flex gap-4 mb-10">
        <input 
          type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
          placeholder="分享你的见解..."
          className="flex-1 bg-gray-50 border-none rounded-xl px-6 py-3 focus:ring-2 focus:ring-blue-500/20"
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg transition-transform active:scale-95">
          <Send size={20} />
        </button>
      </form>

      <div className="space-y-8">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">{c.author[0]}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-gray-900">{c.author}</span>
                  <span className="text-[10px] text-gray-400">{c.timestamp}</span>
                </div>
                <p className="text-gray-600 text-sm">{c.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}