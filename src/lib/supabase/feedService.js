import { supabase } from './client';

// Local fallback memory for public feed posts when Supabase keys are unconfigured
let localPublicPosts = [
  {
    id: 'post_1',
    author_id: 'user_maya',
    author_name: 'Maya',
    author_username: 'maya',
    author_avatar: 'pearl',
    content: 'Some days I don\'t need advice. I just need someone to tell me they feel it too.',
    image_url: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'active',
    like_count: 42,
    comment_count: 8,
    share_count: 5,
    likedByMe: false
  },
  {
    id: 'post_2',
    author_id: 'user_kai',
    author_name: 'Kai',
    author_username: 'kai_sanctuary',
    author_avatar: 'wave',
    content: 'Sitting quietly by the ocean waves. The water always reminds me that tides come back.',
    image_url: null,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    status: 'active',
    like_count: 28,
    comment_count: 3,
    share_count: 2,
    likedByMe: false
  }
];

let localComments = {
  post_1: [
    {
      id: 'c1',
      post_id: 'post_1',
      author_name: 'Sanctuary Member',
      author_username: 'member',
      content: 'Feeling this so deeply today. Thank you for sharing.',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export const feedService = {
  // Fetch Posts with sorting: 'latest' | 'engaged'
  async fetchPosts(sortMode = 'latest') {
    if (supabase) {
      try {
        let query = supabase
          .from('posts')
          .select('*, profiles:author_id(name, username, avatar_url)')
          .eq('status', 'active');

        if (sortMode === 'latest') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('like_count', { ascending: false });
        }

        const { data, error } = await query;
        if (!error && data) {
          const mapped = data.map((p) => ({
            ...p,
            author_name: p.profiles?.name || 'Sanctuary Member',
            author_username: p.profiles?.username || 'member',
            author_avatar: p.profiles?.avatar_url || 'pearl'
          }));
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[Supabase Feed] Fetch error, using fallback:', err);
      }
    }

    // Local Sorting Logic
    let sorted = [...localPublicPosts];
    if (sortMode === 'latest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Most Engaged = likes + comments*2 + shares*3
      sorted.sort((a, b) => {
        const scoreA = a.like_count + a.comment_count * 2 + a.share_count * 3;
        const scoreB = b.like_count + b.comment_count * 2 + b.share_count * 3;
        return scoreB - scoreA;
      });
    }

    return { data: sorted, error: null };
  },

  // Create Public Post (Explicitly User-Published)
  async createPost({ author_id, author_name, author_username, content, image_url }) {
    const newPost = {
      id: `post_${Date.now()}`,
      author_id,
      author_name,
      author_username,
      author_avatar: 'pearl',
      content: content.trim(),
      image_url: image_url || null,
      created_at: new Date().toISOString(),
      status: 'active',
      like_count: 0,
      comment_count: 0,
      share_count: 0
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert([newPost])
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('[Supabase Feed] Create post error, using fallback:', err);
      }
    }

    localPublicPosts.unshift(newPost);
    return { data: newPost, error: null };
  },

  // Toggle Like Post
  async toggleLike(postId, userId) {
    const postIndex = localPublicPosts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      const post = localPublicPosts[postIndex];
      const isLiked = post.likedByMe;
      localPublicPosts[postIndex] = {
        ...post,
        likedByMe: !isLiked,
        like_count: isLiked ? Math.max(0, post.like_count - 1) : post.like_count + 1
      };
      return { data: localPublicPosts[postIndex], error: null };
    }
    return { data: null, error: null };
  },

  // Fetch Comments
  async fetchComments(postId) {
    return { data: localComments[postId] || [], error: null };
  },

  // Add Comment
  async addComment(postId, authorName, authorUsername, content) {
    const newComment = {
      id: `comm_${Date.now()}`,
      post_id: postId,
      author_name: authorName,
      author_username: authorUsername,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    if (!localComments[postId]) localComments[postId] = [];
    localComments[postId].push(newComment);

    const postIndex = localPublicPosts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      localPublicPosts[postIndex].comment_count += 1;
    }

    return { data: newComment, error: null };
  },

  // Record Real Share Action
  async recordShare(postId) {
    const postIndex = localPublicPosts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      localPublicPosts[postIndex].share_count += 1;
      return { data: localPublicPosts[postIndex], error: null };
    }
    return { data: null, error: null };
  },

  // Fetch Public Profile by Username
  async fetchPublicProfile(username) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {}
    }

    // Fallback profile
    return {
      data: {
        id: `user_${username}`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username,
        bio: 'Sanctuary traveler sharing gentle public reflections.',
        avatar_url: 'pearl',
        created_at: '2026-08'
      },
      error: null
    };
  }
};
