import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedService } from '../lib/supabase/feedService';
import { useSanctuary } from '../context/SanctuaryContext';
import { validateCommunityMessage, COMMUNITY_RULES } from '../lib/moderation/communityModeration';

export const Feed = () => {
  const { profile, bottleSafety, reportBottle, blockSender } = useSanctuary();

  const [posts, setPosts] = useState([]);
  const [sortMode, setSortMode] = useState('latest'); // 'latest' | 'engaged'
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Post Composer (TEXT ONLY)
  const [composerText, setComposerText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [composerError, setComposerError] = useState('');

  // Active Comment Input
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState('');

  // Report Modal
  const [reportingPostId, setReportingPostId] = useState(null);
  const [reportReason, setReportReason] = useState('Harassment');

  useEffect(() => {
    loadPosts(sortMode);
  }, [sortMode]);

  const loadPosts = async (mode) => {
    setLoading(true);
    const { data } = await feedService.fetchPosts(mode);
    setLoading(false);
    if (data) {
      // Filter blocked senders & reported posts
      const filtered = data.filter(
        (p) =>
          !bottleSafety.blockedSenders.includes(p.author_id) &&
          !bottleSafety.reportedBottleIds.includes(p.id)
      );
      setPosts(filtered);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setComposerError('');

    const validation = validateCommunityMessage(composerText);
    if (!validation.valid) {
      setComposerError(validation.reason);
      return;
    }

    if (!window.confirm('This will be public on Pearl Club Feed. Proceed?')) {
      return;
    }

    setIsPublishing(true);
    const { data, error } = await feedService.createPost({
      author_id: `user_${profile.name.toLowerCase()}`,
      author_name: profile.name,
      author_username: profile.name.toLowerCase().replace(/\s+/g, '_'),
      content: composerText,
      image_url: null
    });
    setIsPublishing(false);

    if (error) {
      setComposerError(error.message);
    } else {
      setComposerText('');
      loadPosts(sortMode);
    }
  };

  const handleLike = async (postId) => {
    const { data } = await feedService.toggleLike(postId, profile.name);
    if (data) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, like_count: data.like_count, likedByMe: data.likedByMe } : p))
      );
    }
  };

  const handleToggleComments = async (postId) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
    } else {
      setOpenCommentsPostId(postId);
      const { data } = await feedService.fetchComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: data || [] }));
    }
  };

  const handleAddCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const { data } = await feedService.addComment(
      postId,
      profile.name,
      profile.name.toLowerCase().replace(/\s+/g, '_'),
      commentInput
    );

    if (data) {
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
      );

      setCommentInput('');
    }
  };

  const handleShare = async (postId) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pearl Club Feed Post',
          text: 'A quiet reflection from Pearl Club Feed',
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard.');
    }
    feedService.recordShare(postId);
  };

  const handleReportPost = () => {
    if (reportingPostId) {
      reportBottle(reportingPostId, reportReason);
      setPosts((prev) => prev.filter((p) => p.id !== reportingPostId));
      setReportingPostId(null);
      alert('Thank you. The post has been reported and hidden from your feed.');
    }
  };

  return (
    <main className="max-w-[800px] mx-auto pt-24 pb-32 px-organic-padding relative z-10 min-h-[85vh]">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Pearl Club Feed</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            A calm, public space to share thoughts and reflections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowRulesModal(true)}
            className="font-label-sm text-xs font-semibold text-primary bg-white/60 hover:bg-white/90 px-3.5 py-2 rounded-full border border-white/60 shadow-sm transition-transform flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">gavel</span>
            Community Rules
          </button>

          {/* Feed Sorting Switcher */}
          <div className="flex gap-1.5 glass-panel p-1.5 rounded-full border border-white/50 shadow-sm">
            <button
              onClick={() => setSortMode('latest')}
              className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
                sortMode === 'latest' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortMode('engaged')}
              className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-semibold transition-all ${
                sortMode === 'engaged' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-white/40'
              }`}
            >
              Most Engaged
            </button>
          </div>
        </div>
      </header>

      {/* Public Post Composer Card */}
      <section className="glass-panel-opaque rounded-2xl p-6 md:p-8 border border-white/60 shadow-xl mb-8 animate-fade-in">
        <h2 className="font-headline-md text-headline-md text-primary text-lg mb-1">Share a thought</h2>
        <p className="font-label-sm text-xs text-secondary font-semibold mb-3">
          Notice: Your post will be public on Pearl Club Feed.
        </p>

        <form onSubmit={handlePublish} className="flex flex-col gap-3">
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder="What is on your mind today?"
            rows={4}
            className="w-full bg-white/60 border border-white/50 rounded-xl p-4 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container shadow-inner resize-y"
          />

          {composerError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-label-sm text-xs">
              {composerError}
            </div>
          )}

          <div className="flex justify-between items-center mt-1">
            <span className="font-label-sm text-xs text-outline">Public reflection</span>
            <button
              type="submit"
              disabled={isPublishing}
              className="px-6 py-2.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform active:scale-95"
            >
              {isPublishing ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </section>

      {/* Posts Stream */}
      <section className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant italic">Loading feed reflections...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl p-8 text-on-surface-variant italic">
            No public posts yet. Be the first to share a quiet thought.
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-2xl p-6 md:p-8 border border-white/50 shadow-lg flex flex-col gap-4 transition-all"
            >
              {/* Author Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary-container pearl-glow flex items-center justify-center text-primary font-bold text-sm">
                    {post.author_name ? post.author_name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <div className="font-headline-md text-headline-md text-primary text-base font-semibold">
                      {post.author_name}
                    </div>
                    <Link
                      to={`/u/${post.author_username}`}
                      className="font-label-sm text-xs text-outline hover:text-primary underline"
                    >
                      @{post.author_username}
                    </Link>
                  </div>
                </div>

                <span className="font-label-sm text-xs text-outline opacity-80">
                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Post Content */}
              <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post visual"
                  className="w-full max-h-80 object-cover rounded-xl border border-white/50 shadow-sm"
                />
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-white/30 pt-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 font-label-sm text-xs font-semibold px-3 py-1.5 rounded-full transition-transform active:scale-95 ${
                      post.likedByMe
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-white/40 text-on-surface-variant hover:bg-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: post.likedByMe ? "'FILL' 1" : "'FILL' 0" }}>
                      favorite
                    </span>
                    {post.like_count}
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1.5 font-label-sm text-xs font-semibold px-3 py-1.5 rounded-full bg-white/40 text-on-surface-variant hover:bg-white/70 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    {post.comment_count}
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 font-label-sm text-xs font-semibold px-3 py-1.5 rounded-full bg-white/40 text-on-surface-variant hover:bg-white/70 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">share</span>
                    Share
                  </button>
                </div>

                <button
                  onClick={() => setReportingPostId(post.id)}
                  className="text-outline hover:text-error p-1 rounded-full text-xs"
                  title="Report Post"
                >
                  <span className="material-symbols-outlined text-base">flag</span>
                </button>
              </div>

              {/* Comments Section */}
              {openCommentsPostId === post.id && (
                <div className="mt-3 p-4 rounded-xl bg-white/40 border border-white/50 flex flex-col gap-3 animate-fade-in">
                  <h4 className="font-label-sm text-xs text-primary uppercase font-semibold">Comments</h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(commentsMap[post.id] || []).length === 0 ? (
                      <p className="text-xs italic text-outline">No comments yet. Leave a supportive response.</p>
                    ) : (
                      (commentsMap[post.id] || []).map((comm) => (
                        <div key={comm.id} className="p-2.5 rounded-lg bg-white/60 text-xs text-on-surface">
                          <span className="font-semibold text-primary">@{comm.author_username}: </span>
                          {comm.content}
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handleAddCommentSubmit(e, post.id)} className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Write a supportive comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 bg-white/80 border border-white/60 rounded-xl px-3 py-1.5 font-body-md text-xs text-on-surface focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-primary text-white font-label-sm text-xs shadow"
                    >
                      Comment
                    </button>
                  </form>
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-opaque rounded-2xl p-6 flex flex-col gap-4 border border-white/60 shadow-2xl">
            <h3 className="font-headline-md text-headline-md text-error text-lg">Report Feed Post</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white/80 border border-white/60 rounded-xl p-2.5 font-label-sm text-xs text-on-surface focus:outline-none"
            >
              <option value="Harassment">Harassment / Abuse</option>
              <option value="Sexual content">Sexual content</option>
              <option value="Spam">Spam</option>
              <option value="Threat">Threat or danger</option>
              <option value="Personal information">Personal info</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setReportingPostId(null)}
                className="px-4 py-2 rounded-full font-label-sm text-xs text-on-surface-variant hover:bg-white/40"
              >
                Cancel
              </button>
              <button
                onClick={handleReportPost}
                className="px-5 py-2 rounded-full bg-error text-white font-label-sm text-xs font-semibold shadow"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel-opaque rounded-3xl p-6 md:p-8 flex flex-col gap-5 border border-white/60 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
                <h3 className="font-headline-lg text-headline-lg text-primary text-xl font-semibold">Community Guidelines</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant">
              The Pearl Club is a quiet sanctuary. Please follow these core principles:
            </p>

            <div className="flex flex-col gap-3">
              {COMMUNITY_RULES.map((rule) => (
                <div key={rule.id} className="p-3.5 rounded-xl bg-white/50 border border-white/60 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-container/40 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    #{rule.id}
                  </span>
                  <div>
                    <h4 className="font-label-sm text-xs font-semibold text-primary">{rule.title}</h4>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 mt-2"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
