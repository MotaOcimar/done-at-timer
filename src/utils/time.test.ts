import { describe, it, expect } from 'vitest';
import { calculateArrivalTime } from './time';
import { Task } from '../types';

describe('calculateArrivalTime', () => {
  it('should calculate arrival time for pending tasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
      { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      { id: '3', title: 'Task 3', duration: 15, status: 'COMPLETED' } as Task,
    ];
    // status: COMPLETED type assertion needed if 'COMPLETED' is valid but previous test failed?
    // Wait, types.ts has 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'.
    
    const now = new Date('2024-01-01T10:00:00');
    const arrival = calculateArrivalTime(tasks, now);
    // 10 + 20 = 30 minutes
    // Timezone safe? getHours() depends on local time.
    // If running in environment with timezone, tests might fail if Date is interpreted locally.
    // Better to use getTime() or UTC.
    
    // But calculateArrivalTime returns Date object.
    // Let's assume it adds duration to given time.
    const expected = new Date(now.getTime() + 30 * 60 * 1000);
    expect(arrival.getTime()).toBe(expected.getTime());
  });

  it('should handle empty list', () => {
    const tasks: Task[] = [];
    const now = new Date('2024-01-01T10:00:00');
    const arrival = calculateArrivalTime(tasks, now);
    expect(arrival.getTime()).toBe(now.getTime());
  });
});
