import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSanctuary } from '../context/SanctuaryContext';
import { TodoModal } from './TodoModal';

export const BottomNavBar = () => {
  const { activePanel, togglePanel } = useSanctuary();
  const isTodoOpen = activePanel === 'todo';

  return (
    <TodoModal isOpen={isTodoOpen} onClose={() => togglePanel('todo')} />
  );
};
