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
  // Put your admin Gmail email(s) here, e.g.:
  // 'chiko@gmail.com',
  // 'admin@pearlclub.sanctuary'
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

  // 1. Check VITE_ADMIN_EMAIL from .env environment file
  const envAdmin = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
  if (envAdmin && email && email === envAdmin) {
    return true;
  }

  // 2. Check hardcoded / listed emails in ADMIN_EMAILS
  if (email && ADMIN_EMAILS.map((e) => e.toLowerCase().trim()).includes(email)) {
    return true;
  }

  // 3. Check Supabase role / is_admin flag in profile database record
  if (profile?.role === 'admin' || profile?.is_admin === true) {
    return true;
  }

  return false;
};
