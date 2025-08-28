import { useContext } from 'react';
import { ShiftContext } from '../context/ShiftContext';
import type { ShiftContextType } from '../types';

export const useShift = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};
