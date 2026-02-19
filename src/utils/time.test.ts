import { describe, it, expect } from 'vitest';
import { calculateArrivalTime } from './time';
import type { Task } from '../types';

describe('calculateArrivalTime', () => {
  it('should calculate arrival time for pending tasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
      { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      { id: '3', title: 'Task 3', duration: 15, status: 'COMPLETED' },
    ];

    const now = new Date('2024-01-01T10:00:00');
    // 10 + 20 = 30 minutes = 1800 seconds
    const arrival = calculateArrivalTime(tasks, null, now);

    const expected = new Date(now.getTime() + 30 * 60 * 1000);
    expect(arrival.getTime()).toBe(expected.getTime());
  });

  it('should include seconds of the active task', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Active', duration: 10, status: 'IN_PROGRESS' },
      { id: '2', title: 'Pending', duration: 5, status: 'PENDING' },
    ];

    const now = new Date('2024-01-01T10:00:00');
    // Active has 45 seconds left + 5 mins pending (300s) = 345s
    const arrival = calculateArrivalTime(tasks, 45, now);

    const expected = new Date(now.getTime() + 345 * 1000);
    expect(arrival.getTime()).toBe(expected.getTime());
  });
});
