/**
 * Admin Configuration & Authorization System
 * 
 * How to authorize your Admin Gmail email address:
 * 
 * Option A (Recommended - Environment Variable):
 *   Add your email to your `.env` file in the project root:
 *   VITE_ADMIN_EMAIL=your_email@gmail.com
 * 
 * Option B (Hardcode in Config):
 *   Add your Gmail address directly into the `ADMIN_EMAILS` array below:
 *   export const ADMIN_EMAILS = ['your_email@gmail.com'];
 * 
 * Option C (Supabase Database):
 *   Set `role = 'admin'` or `is_admin = true` on your user profile in Supabase.
 */

export const ADMIN_EMAILS = [
  'chbhuvana0505@gmail.com'
];

/**
 * Helper to verify if the current user has admin access
 * @param {Object} user - Supabase user object or currentUser
 * @param {Object} profile - User profile object from SanctuaryContext / Supabase
 * @returns {boolean}
 */
export const checkIsAdmin = (user, profile) => {
  if (!user && !profile) return false;

  const email = (user?.email || profile?.email || '').toLowerCase().trim();
  const envAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
  const adminList = ADMIN_EMAILS.map((e) => e.toLowerCase().trim());

  // 1. Check VITE_ADMIN_EMAIL from .env or ADMIN_EMAILS list
  if (email && (email === envAdmin || adminList.includes(email))) {
    return true;
  }

  // 2. Check Supabase role / is_admin flag in profile database record
  if (profile?.role === 'admin' || profile?.is_admin === true) {
    return true;
  }

  // 3. Local/Guest Mode Testing Fallback:
  // If running locally in guest mode while an admin email is configured, grant admin access
  if ((user?.id === 'guest_user' || user?.is_guest) && (envAdmin || adminList.length > 0)) {
    return true;
  }

  return false;
};
