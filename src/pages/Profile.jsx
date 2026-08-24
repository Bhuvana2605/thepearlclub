import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';

export const Profile = () => {
  const { profile, updateProfile, getProfileStats, formattedPearlNumber, isEarlyMember, signOutUser } = useSanctuary();
  const navigate = useNavigate();
  const stats = getProfileStats();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [bioInput, setBioInput] = useState(profile.bio);
  const [avatarInput, setAvatarInput] = useState(profile.avatar);

  const avatars = [
    { id: 'pearl', name: 'Pearl', icon: 'water_drop' },
    { id: 'wave', name: 'Ocean Wave', icon: 'waves' },
    { id: 'star', name: 'Golden Star', icon: 'stars' },
    { id: 'coral', name: 'Reef Coral', icon: 'nature' }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim() || 'Sanctuary Member',
      bio: bioInput.trim() || 'Finding a little quiet space.',
      avatar: avatarInput
    });
    setIsEditing(false);
  };

  const getAvatarIcon = (avatarId) => {
    const found = avatars.find((a) => a.id === avatarId);
    return found ? found.icon : 'water_drop';
  };

  return (
    <main className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-32 px-organic-padding md:px-bubble-margin">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col gap-8 border border-white/50 relative overflow-hidden">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary-container/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-white/30 pb-4">
          <div>
            <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3 py-1 rounded-full border border-primary-container/30">
              Private Local Profile
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary mt-2">Personal Sanctuary</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="text-error hover:bg-error/10 px-3.5 py-1.5 rounded-full border border-error/30 flex items-center gap-1.5 text-xs font-semibold transition-transform hover:scale-105"
              title="Sign Out of Pearl Club"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out</span>
            </button>

            <Link
              to="/settings"
              className="text-on-surface-variant hover:text-primary p-2 rounded-full glass-panel flex items-center gap-1 text-sm transition-transform hover:scale-105"
              title="Open Settings"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              <span className="font-label-sm text-xs hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Sphere */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container pearl-glow flex items-center justify-center text-primary shadow-lg shrink-0">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {getAvatarIcon(profile.avatar)}
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{profile.name}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant italic mt-1 max-w-md">
              "{profile.bio}"
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 mt-3 font-label-sm text-xs text-outline">
              <span className="bg-primary-container/40 text-primary font-semibold px-3 py-1 rounded-full border border-primary-container/30">
                {formattedPearlNumber}
              </span>
              <span>•</span>
              <span>Member since: August 2026</span>
              <span>•</span>
              <span className={isEarlyMember ? 'text-amber-800 font-semibold' : ''}>
                Early Member: {isEarlyMember ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/40 text-primary hover:bg-white/70 px-4 py-2 rounded-full font-label-sm text-xs shadow-sm border border-white/50 transition-all hover:scale-105"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white/50 border border-white/60 flex flex-col gap-4 shadow-inner animate-fade-in">
            <h3 className="font-headline-md text-headline-md text-primary text-base">Edit Profile Details</h3>

            <div>
              <label className="font-label-sm text-xs text-outline uppercase block mb-1">Avatar Motif</label>
              <div className="flex gap-3">
                {avatars.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarInput(a.id)}
                    className={`p-3 rounded-full flex items-center justify-center transition-all ${
                      avatarInput === a.id ? 'bg-primary text-white shadow' : 'bg-white/40 text-on-surface-variant hover:bg-white/70'
                    }`}
                    title={a.name}
                  >
                    <span className="material-symbols-outlined text-xl">{a.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-label-sm text-xs text-outline uppercase block mb-1">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-white/70 border border-white/50 rounded-xl px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-outline uppercase block mb-1">Short Bio</label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-white/70 border border-white/50 rounded-xl px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full font-label-sm text-xs text-on-surface-variant hover:bg-white/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full font-label-sm text-xs bg-primary text-white shadow hover:bg-primary/90"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        <hr className="border-white/20" />

        {/* Dynamic Personal Statistics Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="font-label-sm text-label-sm text-primary uppercase tracking-widest px-1">
            Personal Sanctuary Stats
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-panel border border-white/40 text-center flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-secondary text-2xl mb-1">center_focus_strong</span>
              <span className="font-headline-lg text-headline-lg text-secondary">{stats.focusSessions}</span>
              <span className="font-label-sm text-xs text-outline mt-1">Focus Sessions</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/40 text-center flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-2xl mb-1">calendar_today</span>
              <span className="font-headline-lg text-headline-lg text-primary">{stats.focusDays}</span>
              <span className="font-label-sm text-xs text-outline mt-1">Focus Days</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/40 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <img src="/assets/collectibles/pearl.png" alt="Focus Pearl" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-headline-lg text-headline-lg text-primary">{stats.focusPearls}</span>
              <span className="font-label-sm text-xs text-outline mt-1">Focus Pearls</span>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-white/40 text-center flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-amber-500 text-2xl mb-1">stars</span>
              <span className="font-headline-lg text-headline-lg text-amber-900 font-bold">{stats.rareFocusRewards}</span>
              <span className="font-label-sm text-xs text-outline mt-1">Rare Focus Rewards</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
