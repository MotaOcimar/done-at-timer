import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

describe('TaskCard (Pure Visual)', () => {
  const mockTask: Task = { id: '1', title: 'Test Task', duration: 10, status: 'PENDING' };

  it('renders title and duration', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={false} 
        isCompleted={false} 
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows progress bar and time left when active', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        timeLeft={300} // 5 min
        progress={0.5}
        isActuallyPaused={false}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/5 min left/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pause/i)).toBeInTheDocument();
  });

  it('shows checkmark when completed', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={false} 
        isCompleted={true} 
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Play/i)).not.toBeInTheDocument();
  });

  it('applies dragging styles', () => {
    const { container } = render(
      <TaskCard 
        task={mockTask} 
        isActive={false} 
        isCompleted={false} 
        isDragging={true}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    // Should have opacity class for dragging
    expect(container.firstChild).toHaveClass('opacity-50');
  });

  it('shows Done button when isTimeUp is true', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        isTimeUp={true}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    // The "Done" button should be visible and prominent
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
  });

  it('shows actual duration when completed', () => {
    const completedTask: Task = { ...mockTask, status: 'COMPLETED', actualDuration: 15 };
    render(
      <TaskCard 
        task={completedTask} 
        isActive={false} 
        isCompleted={true}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByText('(took 15 min)')).toBeInTheDocument();
  });

  it('shows remaining time in subtitle when active', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        timeLeft={300} // 5 min left
        progress={0.5}
        isActuallyPaused={false}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    // the label should be e.g. "10 min total · 5 min left" or something similar with these parts
    expect(screen.getByText(/· 5 min left/i)).toBeInTheDocument();
  });

  it('shows overtime in subtitle when active and in overtime', () => {
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        isTimeUp={true}
        timeLeft={-120} // 2 min over
        progress={1}
        isActuallyPaused={false}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByText(/· 2 min over/i)).toBeInTheDocument();
  });

  it('shows formatted ETA in progress footer when active', () => {
    const eta = new Date('2026-01-01T08:35:00Z');
    render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        timeLeft={300}
        progress={0.5}
        isActuallyPaused={false}
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(screen.getByText(/→/i)).toBeInTheDocument();
    // Use an exact match or regex for the formatted time. It depends on local timezone in tests, 
    // so we can just check if it contains "→ " followed by a number.
    expect(screen.getByText(/→ \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('shows ETA on subtitle for pending cards', () => {
    const eta = new Date('2026-01-01T09:15:00Z');
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
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(eta);
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();
  });
  it('shows actual finish time for completed cards', () => {
    const completedTask: Task = { ...mockTask, status: 'COMPLETED' };
    const completionTime = new Date('2026-01-01T08:32:00Z');
    render(
      <TaskCard
        task={completedTask}
        isActive={false}
        isCompleted={true}
        eta={completionTime}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(completionTime);
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();
  });});
