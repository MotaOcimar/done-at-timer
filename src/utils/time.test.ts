import { describe, it, expect } from 'vitest';
import { calculateArrivalTime, calculateIntermediateETAs } from './time';
import type { Task } from '../types';

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

  it('is consistent with the last task ETA in calculateIntermediateETAs', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'IN_PROGRESS' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    const timeLeft = 300; // 5 min
    
    const arrivalTime = calculateArrivalTime(tasks, timeLeft, now);
    const etas = calculateIntermediateETAs(tasks, timeLeft, now);
    
    expect(arrivalTime.toISOString()).toBe(etas.get('2')?.toISOString());
  });

  it('handles overtime consistently between both functions', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'IN_PROGRESS' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    const timeLeft = -300; // 5 min overtime
    
    const arrivalTime = calculateArrivalTime(tasks, timeLeft, now);
    const etas = calculateIntermediateETAs(tasks, timeLeft, now);
    
    // BOTH should return 10:20 (now + T2 duration)
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:20:00Z').toISOString());
    expect(arrivalTime.toISOString()).toBe(etas.get('2')?.toISOString());
  });
});

describe('calculateIntermediateETAs', () => {
  it('all-pending, no active task', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'PENDING' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, null, now);
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T10:10:00Z').toISOString());
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:30:00Z').toISOString());
  });

  it('active + pending', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'IN_PROGRESS' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, 300, now); // 5 min left on T1
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T10:05:00Z').toISOString());
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:25:00Z').toISOString());
  });

  it('completed + active + pending', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'COMPLETED', completedAt: new Date('2026-01-01T09:50:00Z').getTime() },
      { id: '2', title: 'T2', duration: 20, status: 'IN_PROGRESS' },
      { id: '3', title: 'T3', duration: 15, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, 600, now); // 10 min left on T2
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T09:50:00Z').toISOString());
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:10:00Z').toISOString());
    expect(etas.get('3')?.toISOString()).toBe(new Date('2026-01-01T10:25:00Z').toISOString());
  });

  it('overtime (active timeLeft <= 0)', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'IN_PROGRESS' },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, -120, now); // 2 min overtime on T1
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T10:00:00Z').toISOString());
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:20:00Z').toISOString());
  });

  it('all completed', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'COMPLETED', completedAt: new Date('2026-01-01T09:50:00Z').getTime() },
      { id: '2', title: 'T2', duration: 20, status: 'COMPLETED', completedAt: new Date('2026-01-01T10:10:00Z').getTime() },
    ];
    const now = new Date('2026-01-01T10:20:00Z');
    
    const etas = calculateIntermediateETAs(tasks, null, now);
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T09:50:00Z').toISOString());
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:10:00Z').toISOString());
  });

  it('completed before pending without active task', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'COMPLETED', completedAt: new Date('2026-01-01T09:50:00Z').getTime() },
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, null, now);
    
    expect(etas.get('1')?.toISOString()).toBe(new Date('2026-01-01T09:50:00Z').toISOString());
    // Pending chains from 'now' (10:00), not affected by completed task
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:20:00Z').toISOString());
  });

  it('completed without completedAt is ignored and pending chains from now', () => {
    const tasks: Task[] = [
      { id: '1', title: 'T1', duration: 10, status: 'COMPLETED' }, // Legacy task without completedAt
      { id: '2', title: 'T2', duration: 20, status: 'PENDING' },
    ];
    const now = new Date('2026-01-01T10:00:00Z');
    
    const etas = calculateIntermediateETAs(tasks, null, now);
    
    expect(etas.has('1')).toBe(false);
    expect(etas.get('2')?.toISOString()).toBe(new Date('2026-01-01T10:20:00Z').toISOString());
  });
});
