# The Pearl Club - Database Architecture & Privacy Boundary

This document outlines the database schema, data separation, and Row Level Security (RLS) policies for **The Pearl Club**.

---

## 1. Strict Privacy & Data Separation Boundary

To maintain a calm, low-pressure digital sanctuary, private user data is kept strictly local in the user's browser, while only explicitly published content touches the Supabase backend.

| Data Type | Storage Location | Accessibility |
| :--- | :--- | :--- |
| **Chronicle Journal** | Local Browser `localStorage` | Private (Device Only) |
| **Mood Canvas Drawings** | Local Browser `localStorage` | Private (Device Only) |
| **Tasks & To-Do Priorities** | Local Browser `localStorage` | Private (Device Only) |
| **Focus History** | Local Browser `localStorage` | Private (Device Only) |
| **Aquarium & Inventory** | Local Browser `localStorage` | Private (Device Only) |
| **Found & Achieved Rewards** | Local Browser `localStorage` | Private (Device Only) |
| **Auth Users & Profiles** | Supabase `auth.users` & `profiles` | Public Profile |
| **Feed Posts & Comments** | Supabase `posts` & `comments` | Public Community |
| **Post Likes & Shares** | Supabase `post_likes` | Public Community |
| **Safety Reports** | Supabase `reports` | Moderation Layer |

---

## 2. Table Definitions

### `profiles`
- `id`: `UUID` (Foreign key to `auth.users.id`)
- `name`: `TEXT`
- `username`: `TEXT` (Unique handle)
- `bio`: `TEXT`
- `avatar_url`: `TEXT`
- `created_at`: `TIMESTAMPTZ`

### `posts`
- `id`: `TEXT`
- `author_id`: `UUID` (Foreign key to `profiles.id`)
- `content`: `TEXT`
- `image_url`: `TEXT` (Optional)
- `created_at`: `TIMESTAMPTZ`
- `status`: `TEXT` (`'active'`, `'hidden'`, `'reported'`, `'removed'`)
- `like_count`: `INT`
- `comment_count`: `INT`
- `share_count`: `INT`

### `comments`
- `id`: `TEXT`
- `post_id`: `TEXT` (Foreign key to `posts.id`)
- `author_id`: `UUID` (Foreign key to `profiles.id`)
- `content`: `TEXT`
- `created_at`: `TIMESTAMPTZ`

---

## 3. RLS Security Guarantee

1. Users can **only** update or delete their own profile, posts, or comments.
2. Service-role keys are never exposed in frontend code.
3. Private journal text or drawings are **never** uploaded to Supabase.
