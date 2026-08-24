import React from 'react';
import { RewardRevealModal } from './RewardRevealModal';

/**
 * One-Time Welcome Reward Modal for Early Pearl Club Members (First 100 Users)
 */
export const EarlyMemberModal = ({ isOpen, onClose, pearlNumberStr }) => {
  if (!isOpen) return null;

  return (
    <RewardRevealModal
      isOpen={isOpen}
      onClose={onClose}
      collectibleId="pearl-club-early-member"
      title={`${pearlNumberStr || 'Early Member'} • Founding Member`}
      subtitle={`Welcome! As ${pearlNumberStr || 'Pearl #001'}, your exclusive Founding Member collectible has been added to your sanctuary.`}
      onClaim={onClose}
    />
  );
};

export default EarlyMemberModal;
