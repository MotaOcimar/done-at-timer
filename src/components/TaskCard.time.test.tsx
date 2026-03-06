import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

describe('TaskCard Time Formatting', () => {
  const mockTask: Task = { id: '1', title: 'Test Task', duration: 10, status: 'PENDING' };

  it('uses 24-hour format for ETAs (no AM/PM)', () => {
    // 13:30 (1:30 PM)
    const eta = new Date('2026-01-01T13:30:00Z');
    
    render(
      <TaskCard 
        task={mockTask} 
        isActive={false} 
        isCompleted={false} 
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    
    // Should show 13:30, not 01:30 PM or 1:30 PM
    const timeElement = screen.getByText(/13:30/);
    expect(timeElement).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AM/i)).not.toBeInTheDocument();
  });

  it('uses 24-hour format for active task ETA', () => {
    const eta = new Date('2026-01-01T13:30:00Z');
    
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        eta={eta}
        timeLeft={600}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    
    const timeElement = screen.getByText(/13:30/);
    expect(timeElement).toBeInTheDocument();
    expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
  });
});
