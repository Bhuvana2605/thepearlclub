/**
 * Centralized Community Moderation & Validation System
 * 
 * Enforces Pearl Club Community Guidelines across Feed posts, comments,
 * and Message in a Bottle content.
 */

export const COMMUNITY_RULES = [
  { id: 1, title: "Be respectful", description: "Treat all sanctuary members with kindness and warmth." },
  { id: 2, title: "No harassment or abuse", description: "Targeted insults, bullying, and hate speech are strictly prohibited." },
  { id: 3, title: "No sexual or 18+ content", description: "Keep all posts and messages appropriate for a gentle sanctuary." },
  { id: 4, title: "No threats or violence", description: "Threats of harm or self-harm are blocked immediately." },
  { id: 5, title: "No spam or promotion", description: "Advertising, commercial links, and repeated posts are forbidden." },
  { id: 6, title: "Do not share personal info", description: "Protect your privacy. Never share phone numbers, addresses, or private details." },
  { id: 7, title: "No impersonation", description: "Do not pretend to be another member or staff." },
  { id: 8, title: "Maintain gentle atmosphere", description: "Keep shared content supportive, serene, and calm." }
];

export function validateCommunityMessage(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, reason: "Message content cannot be empty.", category: "empty" };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "Message content cannot be empty.", category: "empty" };
  }

  if (trimmed.length > 500) {
    return { valid: false, reason: "Message exceeds maximum length of 500 characters.", category: "length" };
  }

  // Check for repeated characters or gibberish spam (e.g., "aaaaaaa...")
  if (/(.)\1{9,}/.test(trimmed)) {
    return { valid: false, reason: "Message contains excessive repeated characters.", category: "spam" };
  }

  // Check for phone numbers or email patterns (Privacy protection)
  const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  if (phonePattern.test(trimmed) || emailPattern.test(trimmed)) {
    return { valid: false, reason: "Sharing personal contact details (phone/email) is not allowed for privacy.", category: "personal_info" };
  }

  // Check for suspicious promotional links or spam patterns
  if (/(https?:\/\/[^\s]+)/gi.test(trimmed)) {
    const urlMatches = trimmed.match(/(https?:\/\/[^\s]+)/gi);
    if (urlMatches && urlMatches.length > 2) {
      return { valid: false, reason: "Promotional links and URL spam are prohibited.", category: "spam" };
    }
  }

  // Abusive / Slur / Hate speech filter terms
  const abusiveTerms = ['hate', 'kill yourself', 'die', 'slur', 'nazi', 'abuse', 'bitch', 'fuck', 'shit', 'asshole'];
  const lower = trimmed.toLowerCase();
  for (const term of abusiveTerms) {
    if (lower.includes(term)) {
      return { valid: false, reason: `Message violates Community Rule: No harassment, threats, or abusive language.`, category: "abuse" };
    }
  }

  // Sexual / 18+ content terms
  const sexualTerms = ['porn', 'nsfw', 'naked', 'sex', 'nude', 'erotic', 'explicit'];
  for (const term of sexualTerms) {
    if (lower.includes(term)) {
      return { valid: false, reason: "Message violates Community Rule: No sexual or 18+ content.", category: "sexual" };
    }
  }

  return { valid: true };
}
