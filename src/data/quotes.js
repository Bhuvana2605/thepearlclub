/**
 * Curated Pearl Club Quotes Library
 * Calming, reflective, reassuring, non-productivity quotes.
 * Designed to support long-term expansion to 366 daily quotes.
 */

export const CURATED_QUOTES = [
  {
    id: 'q1',
    text: 'Nothing needs to be solved all at once.',
    preferredTimeOfDay: 'evening'
  },
  {
    id: 'q2',
    text: 'Rest is allowed.',
    preferredTimeOfDay: 'night'
  },
  {
    id: 'q3',
    text: 'Take this one thing at a time.',
    preferredTimeOfDay: 'morning'
  },
  {
    id: 'q4',
    text: 'The tide comes back.',
    preferredTimeOfDay: 'afternoon'
  },
  {
    id: 'q5',
    text: 'You are allowed to simply exist.',
    preferredTimeOfDay: 'late_morning'
  },
  {
    id: 'q6',
    text: 'Softness is a strength in a noisy world.',
    preferredTimeOfDay: 'evening'
  },
  {
    id: 'q7',
    text: 'Breathe out what you do not need to carry.',
    preferredTimeOfDay: 'night'
  },
  {
    id: 'q8',
    text: 'Quiet moments nourish deep roots.',
    preferredTimeOfDay: 'morning'
  },
  {
    id: 'q9',
    text: 'Surrender to the rhythm of the ocean.',
    preferredTimeOfDay: 'afternoon'
  },
  {
    id: 'q10',
    text: 'There is no rush in a sanctuary.',
    preferredTimeOfDay: 'late_morning'
  },
  {
    id: 'q11',
    text: 'Let your thoughts drift like foam on water.',
    preferredTimeOfDay: 'evening'
  },
  {
    id: 'q12',
    text: 'Tomorrow will arrive when it is ready.',
    preferredTimeOfDay: 'night'
  }
];

/**
 * Deterministically select a quote based on date string (YYYY-MM-DD) and timeOfDay.
 * Ensures the same date/time returns the exact same quote on refresh.
 */
export function getQuoteForDateAndTime(dateStr, timeOfDay = 'afternoon') {
  if (!dateStr) dateStr = new Date().toISOString().split('T')[0];

  const seed = `${dateStr}-${timeOfDay}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % CURATED_QUOTES.length;
  return CURATED_QUOTES[index];
}
