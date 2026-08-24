import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feedService } from '../lib/supabase/feedService';

export const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: prof } = await feedService.fetchPublicProfile(username);
      const { data: allPosts } = await feedService.fetchPosts('latest');

      setProfileData(prof);
      if (allPosts) {
        const userOnly = allPosts.filter(
          (p) => p.author_username?.toLowerCase() === username?.toLowerCase()
        );
        setUserPosts(userOnly);
      }
      setLoading(false);
    }

    loadData();
  }, [username]);

  if (loading) {
    return (
      <main className="max-w-[800px] mx-auto pt-32 pb-32 px-organic-padding text-center italic text-on-surface-variant">
        Loading public profile...
      </main>
    );
  }

  if (!profileData) {
    return (
      <main className="max-w-[800px] mx-auto pt-32 pb-32 px-organic-padding text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary">Profile Not Found</h1>
        <Link to="/feed" className="text-primary underline font-label-sm text-xs mt-2 block">
          Back to Feed
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[800px] mx-auto pt-24 pb-32 px-organic-padding relative z-10 min-h-[85vh]">
      {/* Profile Header Card */}
      <div className="glass-panel-opaque rounded-[2rem] p-8 md:p-10 border border-white/60 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container pearl-glow flex items-center justify-center text-primary shadow-lg shrink-0">
          <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            water_drop
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3 py-0.5 rounded-full border border-primary-container/30">
            Public Profile
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-headline-lg text-headline-lg text-primary">{profileData.name}</h1>
            <span className="font-label-sm text-xs font-semibold text-primary bg-primary-container/40 px-2.5 py-0.5 rounded-full border border-primary-container/30">
              {profileData.pearl_number ? `Pearl #${String(profileData.pearl_number).padStart(3, '0')}` : 'Pearl number unavailable'}
            </span>
          </div>
          <p className="font-label-sm text-xs text-outline">@{profileData.username}</p>
          <p className="font-body-md text-body-md text-on-surface-variant italic mt-2 max-w-md">
            "{profileData.bio}"
          </p>
        </div>

        <Link
          to="/feed"
          className="px-4 py-2 rounded-full glass-panel border border-white/60 text-primary font-label-sm text-xs shadow-sm hover:scale-105 transition-transform shrink-0"
        >
          Back to Feed
        </Link>
      </div>

      {/* User's Public Posts Stream */}
      <section className="flex flex-col gap-6">
        <h2 className="font-headline-md text-headline-md text-primary text-lg">
          Public Reflections ({userPosts.length})
        </h2>

        {userPosts.length === 0 ? (
          <div className="text-center py-8 glass-panel rounded-2xl p-6 text-on-surface-variant italic">
            This user has not published any public thoughts on the Feed yet.
          </div>
        ) : (
          userPosts.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-2xl p-6 border border-white/50 shadow-md flex flex-col gap-3"
            >
              <div className="flex justify-between items-center text-xs font-label-sm text-outline">
                <span>@{post.author_username}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-xs font-label-sm text-outline pt-2 border-t border-white/20">
                <span>♡ {post.like_count} likes</span>
                <span>💬 {post.comment_count} comments</span>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};
