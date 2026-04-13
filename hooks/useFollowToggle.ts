import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useFollowToggle(
  currentUser: any,
  onSuccess?: (targetId: string, nowFollowing: boolean) => void
) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggle = async (e: React.MouseEvent, targetId: string, isFollowing: boolean) => {
    e.stopPropagation();
    if (!currentUser) { router.push('/login'); return; }
    if (currentUser.id === targetId || togglingId) return;

    setTogglingId(targetId);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetId);
        onSuccess?.(targetId, false);
      } else {
        await supabase.from('follows').insert([{
          follower_id: currentUser.id,
          following_id: targetId,
        }]);
        onSuccess?.(targetId, true);
        try {
          await supabase.from('notifications').insert([{
            user_id: targetId,
            type: 'follow',
            actor_name: currentUser.email?.split('@')[0] || '某用户',
          }]);
        } catch {}
      }
    } finally {
      setTogglingId(null);
    }
  };

  return { toggle, togglingId };
}
