import type { Task } from '../types';

export type CardState = 'completed' | 'idle' | 'overtime' | 'paused' | 'running';

export const getCardState = (
  task: Task, 
  isActive: boolean, 
  isTimeUp: boolean, 
  isActuallyPaused: boolean
): CardState => {
  if (task.status === 'COMPLETED') return 'completed';
  if (!isActive) return 'idle';
  if (isTimeUp) return 'overtime';
  if (isActuallyPaused) return 'paused';
  return 'running';
};

export const cardBorderClasses: Record<CardState, string> = {
  completed: 'border-green-100',
  idle: 'border-gray-100',
  overtime: 'border-amber-300',
  paused: 'border-gray-300',
  running: 'border-blue-500'
};
