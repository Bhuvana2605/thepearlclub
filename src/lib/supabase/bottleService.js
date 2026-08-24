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
  async fetchRandomBottle() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bottles')
          .select('*')
          .eq('status', 'approved')
          .limit(20);

        if (!error && data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          return { data: data[randomIndex], error: null };
        }
      } catch (err) {
        console.warn('[Supabase Bottle] Fetch error, using fallback:', err);
      }
    }

    const randomIndex = Math.floor(Math.random() * localBottles.length);
    return { data: localBottles[randomIndex], error: null };
  },

  async sendBottle(content) {
    const validation = validateBottleText(content);
    if (!validation.valid) {
      return { data: null, error: new Error(validation.reason) };
    }

    const newBottle = {
      id: `bottle_${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      status: 'approved',
      sender_id: `anon_${Date.now()}`
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
