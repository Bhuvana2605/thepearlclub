import React from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { RewardRevealModal } from './RewardRevealModal';

export const GoldenPearlPopup = ({ isOpen, onClose }) => {
  const { collectGoldenPearl, markGoldenPearlRevealed } = useSanctuary();

  if (!isOpen) return null;

  const handleCollect = () => {
    collectGoldenPearl();
    markGoldenPearlRevealed();
    onClose();
  };

  return (
    <RewardRevealModal
      isOpen={isOpen}
      onClose={handleCollect}
      collectibleId="golden-pearl"
      title="Discovery"
      subtitle="A quiet moment of reflection has brought a rare treasure to the surface."
      onClaim={handleCollect}
    />
  );
};
