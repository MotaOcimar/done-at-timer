import { describe, it, expect } from 'vitest';
import { calculateArrivalTime } from './time';
import { Task } from '../types';

describe('calculateArrivalTime', () => {
  const tasks: Task[] = [
    { id: '1', title: 'T1', duration: 10, status: 'IN_PROGRESS' },
    { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    { id: '3', title: 'T3', duration: 5, status: 'COMPLETED' },
  ];

  it('calculates arrival time when a task is in progress', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const timeLeftInSeconds = 300; // 5 minutes left of T1
    
    const result = calculateArrivalTime(tasks, timeLeftInSeconds, now);
    
    // 10:00 + 5m (T1) + 20m (T2) = 10:25
    expect(result.toISOString()).toBe(new Date('2026-01-01T10:25:00Z').toISOString());
  });

  it('calculates arrival time when a task is paused (timeLeft provided but not running)', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const timeLeftInSeconds = 600; // T1 paused with 10 minutes left
    
    const result = calculateArrivalTime(tasks, timeLeftInSeconds, now);
    
    // Mesmo pausado, se eu começar agora:
    // 10:00 + 10m (T1 rest) + 20m (T2) = 10:30
    expect(result.toISOString()).toBe(new Date('2026-01-01T10:30:00Z').toISOString());
  });

  it('calculates arrival time when no task is in progress', () => {
    const pendingTasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'PENDING' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const result = calculateArrivalTime(pendingTasks, null, now);
    
    // 10:00 + 10m + 20m = 10:30
    expect(result.toISOString()).toBe(new Date('2026-01-01T10:30:00Z').toISOString());
  });
});
