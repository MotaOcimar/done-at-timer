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
    expect(screen.getByText('5 min left')).toBeInTheDocument();
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
});
