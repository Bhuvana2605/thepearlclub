import React from 'react';
import { useLocation } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';
import { WebGLWaterShader } from './WebGLWaterShader';
import { EnvironmentBackground } from './EnvironmentBackground';
import { EarlyMemberModal } from './EarlyMemberModal';
import { RewardRevealModal } from './RewardRevealModal';
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
        <RewardRevealModal
          isOpen={Boolean(pendingSurpriseReward)}
          onClose={() => setPendingSurpriseReward(null)}
          collectibleId={pendingSurpriseReward.collectibleId}
          title={pendingSurpriseReward.title}
          subtitle={pendingSurpriseReward.subtitle}
        />
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
