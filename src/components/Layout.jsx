import React from 'react';
import { useLocation } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';
import { WebGLWaterShader } from './WebGLWaterShader';
import { EnvironmentBackground } from './EnvironmentBackground';
import { EarlyMemberModal } from './EarlyMemberModal';
import { useSanctuary } from '../context/SanctuaryContext';

export const Layout = ({ children }) => {
  const location = useLocation();
  const {
    currentUser,
    showEarlyMemberWelcomeModal,
    claimEarlyMemberModal,
    formattedPearlNumber,
    pendingSurpriseReward,
    setPendingSurpriseReward
  } = useSanctuary();

  const isDoNothing = location.pathname === '/do-nothing';
  const isAquariumWorld = location.pathname === '/world' || location.pathname === '/focus-aquarium';
  const isAuthScreen = ['/login', '/signup', '/forgot-password', '/auth'].includes(location.pathname);
  const showAuthenticatedNav = Boolean(currentUser && !isAuthScreen);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between">
      {/* Global Environment Theme Background (App-Wide Across All Pages) */}
      {!isAquariumWorld && <EnvironmentBackground />}

      {/* Background WebGL Caustics Shader (Preserved from Stitch) */}
      {!isDoNothing && !isAquariumWorld && (
        <WebGLWaterShader className="fixed inset-0 w-full h-full z-0 opacity-60 mix-blend-overlay pointer-events-none" />
      )}

      {/* One-Time Founding Member Welcome Reward Modal */}
      {showAuthenticatedNav && (
        <EarlyMemberModal
          isOpen={showEarlyMemberWelcomeModal}
          onClose={claimEarlyMemberModal}
          pearlNumberStr={formattedPearlNumber}
        />
      )}

      {/* Return Day Milestone Surprise Reward Modal */}
      {showAuthenticatedNav && pendingSurpriseReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-opaque rounded-3xl p-8 flex flex-col items-center text-center gap-5 border border-white/60 shadow-2xl relative z-10">
            <span className="font-label-sm text-xs text-primary font-semibold uppercase tracking-widest bg-primary-container/40 px-3.5 py-1 rounded-full border border-primary-container/30">
              Return Milestone Reward
            </span>
            <div>
              <h2 className="font-headline-lg text-xl font-semibold text-primary">{pendingSurpriseReward.title}</h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">{pendingSurpriseReward.subtitle}</p>
            </div>

            <div className="w-24 h-24 rounded-full bg-white/80 border border-white/70 flex items-center justify-center p-3 shadow-md pearl-glow my-2">
              <img
                src={`/assets/collectibles/${pendingSurpriseReward.collectibleId}.png`}
                alt="Surprise Reward"
                className="w-16 h-16 object-contain"
                onError={(e) => { e.target.src = '/assets/collectibles/pearl.png'; }}
              />
            </div>

            <button
              onClick={() => setPendingSurpriseReward(null)}
              className="w-full py-3.5 rounded-full bg-primary text-white font-label-sm text-xs font-semibold shadow hover:bg-primary/90 transition-transform active:scale-95"
            >
              Add to Your Little World
            </button>
          </div>
        </div>
      )}

      {/* Floating Header & Navbars (Authenticated Only) */}
      {showAuthenticatedNav && <TopAppBar />}
      {showAuthenticatedNav && <SideNavBar />}

      {/* Main Screen Content */}
      <div className="relative z-10 flex-grow w-full">
        {children}
      </div>

      {/* Floating Bottom Toolbar (Authenticated Only) */}
      {showAuthenticatedNav && <BottomNavBar />}
    </div>
  );
};
