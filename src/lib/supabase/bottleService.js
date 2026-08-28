import { supabase } from './client';
import { validateCommunityMessage } from '../moderation/communityModeration';

/**
 * Validates bottle text content against character limits, spam, and community rules.
 */
export function validateBottleText(text) {
  const result = validateCommunityMessage(text);
  if (!result.valid) {
    return { valid: false, reason: result.reason };
  }
  return { valid: true, reason: null };
}

// In-memory local fallback storage
let localBottles = [
  {
    id: 'local_1',
    content: 'Sending a quiet wave across the ocean. Hope your day feels a little lighter.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'approved',
    sender_id: 'anon_1'
  },
  {
    id: 'local_2',
    content: 'Remember that resting is part of moving forward. You are doing okay.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'approved',
    sender_id: 'anon_2'
  }
];

export const bottleService = {
  async fetchRandomBottle(currentUserId) {
    if (supabase) {
      try {
        let query = supabase
          .from('bottles')
          .select('*')
          .eq('status', 'approved');

        if (currentUserId && !currentUserId.startsWith('guest_')) {
          query = query.neq('sender_id', currentUserId);
        }

        const { data, error } = await query.limit(30);

        if (!error && data && data.length > 0) {
          const available = data.filter(
            (b) => !currentUserId || (b.sender_id !== currentUserId && b.user_id !== currentUserId)
          );
          if (available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            return { data: available[randomIndex], error: null };
          }
        }
      } catch (err) {
        console.warn('[Supabase Bottle] Fetch error, using fallback:', err);
      }
    }

    const availableLocal = localBottles.filter(
      (b) => !currentUserId || (b.sender_id !== currentUserId && b.user_id !== currentUserId)
    );
    const targetPool = availableLocal.length > 0 ? availableLocal : localBottles;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    return { data: targetPool[randomIndex], error: null };
  },

  async sendBottle(content, currentUserId) {
    const validation = validateBottleText(content);
    if (!validation.valid) {
      return { data: null, error: new Error(validation.reason) };
    }

    const userId = currentUserId || `anon_${Date.now()}`;
    const newBottle = {
      id: `bottle_${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      status: 'approved',
      sender_id: userId,
      user_id: userId
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bottles')
          .insert([newBottle])
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('[Supabase Bottle] Insert error, saving locally:', err);
      }
    }

    localBottles.push(newBottle);
    return { data: newBottle, error: null };
  }
};
