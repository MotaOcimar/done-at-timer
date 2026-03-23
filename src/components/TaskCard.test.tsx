// @vitest-environment happy-dom
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
        cardState="idle"
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
        cardState="running"
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
        cardState="completed"
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
        cardState="idle"
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
        cardState="overtime"
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
        cardState="completed"
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
        cardState="running"
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
        cardState="overtime"
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
        cardState="running"
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
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit', hour12: false }).format(eta);
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();
  });

  it('shows ETA on subtitle for pending cards', () => {
    const eta = new Date('2026-01-01T09:15:00Z');
    render(
      <TaskCard
        task={mockTask}
        isActive={false}
        isCompleted={false}
        cardState="idle"
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit', hour12: false }).format(eta);
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
        cardState="completed"
        eta={completionTime}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit', hour12: false }).format(completionTime);
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();
  });

  it('uses consistent styling for ETA across states', () => {
    const eta = new Date('2026-01-01T08:35:00Z');
    
    // Active state
    const { rerender } = render(
      <TaskCard 
        task={mockTask} 
        isActive={true} 
        isCompleted={false} 
        cardState="running"
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const expectedTime = new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit', hour12: false }).format(eta);
    const activeEta = screen.getByText(new RegExp(expectedTime));
    expect(activeEta).toHaveClass('text-sm');
    expect(activeEta).toHaveClass('font-bold');
    expect(activeEta).not.toHaveClass('font-black');

    // Pending state
    rerender(
      <TaskCard 
        task={mockTask} 
        isActive={false} 
        isCompleted={false} 
        cardState="idle"
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const pendingEta = screen.getByText(new RegExp(expectedTime));
    expect(pendingEta).toHaveClass('text-xs');
    expect(pendingEta).toHaveClass('font-bold');
    expect(pendingEta).not.toHaveClass('text-[10px]');

    // Completed state
    rerender(
      <TaskCard 
        task={{ ...mockTask, status: 'COMPLETED' }} 
        isActive={false} 
        isCompleted={true} 
        cardState="completed"
        eta={eta}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        onTitleSave={vi.fn()}
        onDurationSave={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    const completedEta = screen.getByText(new RegExp(expectedTime));
    expect(completedEta).toHaveClass('text-xs');
    expect(completedEta).toHaveClass('font-bold');
    expect(completedEta).not.toHaveClass('text-[10px]');
  });

  describe('Phase 1: Reordering & Cleanup', () => {
    it('does not render GripHorizontal icon or spacer div for any task', () => {
      const { container, rerender } = render(
        <TaskCard 
          task={mockTask} 
          isActive={false} 
          isCompleted={false} 
          cardState="idle"
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      // GripHorizontal is typically rendered as an svg or a div with aria-label
      expect(screen.queryByLabelText(/Drag to reorder/i)).not.toBeInTheDocument();
      // Check for spacer div (w-5 flex-shrink-0)
      const spacer = container.querySelector('.w-5.flex-shrink-0');
      expect(spacer).not.toBeInTheDocument();

      // Rerender as active
      rerender(
        <TaskCard 
          task={mockTask} 
          isActive={true} 
          isCompleted={false} 
          cardState="running"
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      expect(container.querySelector('.w-5.flex-shrink-0')).not.toBeInTheDocument();
    });

    it('stops propagation on onPointerDown for Play/Pause button', () => {
      const onToggle = vi.fn();
      const containerOnPointerDown = vi.fn();
      render(
        <div onPointerDown={containerOnPointerDown}>
          <TaskCard 
            task={mockTask} 
            isActive={false} 
            isCompleted={false} 
            cardState="idle"
            onToggle={onToggle}
            onDelete={vi.fn()}
            onTitleSave={vi.fn()}
            onDurationSave={vi.fn()}
            onComplete={vi.fn()}
          />
        </div>
      );

      const playButton = screen.getByLabelText(/Play task/i);
      const event = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });
      playButton.dispatchEvent(event);
      
      expect(containerOnPointerDown).not.toHaveBeenCalled();
    });

    it('stops propagation on onPointerDown for Done button', () => {
      const onComplete = vi.fn();
      const containerOnPointerDown = vi.fn();
      render(
        <div onPointerDown={containerOnPointerDown}>
          <TaskCard 
            task={mockTask} 
            isActive={true} 
            isCompleted={false} 
            cardState="running"
            onComplete={onComplete}
            onDelete={vi.fn()}
            onToggle={vi.fn()}
            onTitleSave={vi.fn()}
            onDurationSave={vi.fn()}
          />
        </div>
      );

      const doneButton = screen.getByRole('button', { name: /Done/i });
      const event = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });
      doneButton.dispatchEvent(event);
      
      expect(containerOnPointerDown).not.toHaveBeenCalled();
    });

    it('stops propagation on onTouchStart for Play button (prevents TouchSensor activation)', () => {
      const containerOnTouchStart = vi.fn();
      render(
        <div onTouchStart={containerOnTouchStart}>
          <TaskCard
            task={mockTask}
            isActive={false}
            isCompleted={false}
            cardState="idle"
            onToggle={vi.fn()}
            onDelete={vi.fn()}
            onTitleSave={vi.fn()}
            onDurationSave={vi.fn()}
            onComplete={vi.fn()}
          />
        </div>
      );

      const playButton = screen.getByLabelText(/Play task/i);
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      });
      playButton.dispatchEvent(event);

      expect(containerOnTouchStart).not.toHaveBeenCalled();
    });

    it('stops propagation on onTouchStart for Done button (prevents TouchSensor activation)', () => {
      const containerOnTouchStart = vi.fn();
      render(
        <div onTouchStart={containerOnTouchStart}>
          <TaskCard
            task={mockTask}
            isActive={true}
            isCompleted={false}
            cardState="running"
            onComplete={vi.fn()}
            onDelete={vi.fn()}
            onToggle={vi.fn()}
            onTitleSave={vi.fn()}
            onDurationSave={vi.fn()}
          />
        </div>
      );

      const doneButton = screen.getByRole('button', { name: /Done/i });
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      });
      doneButton.dispatchEvent(event);

      expect(containerOnTouchStart).not.toHaveBeenCalled();
    });

    it('respects cardState prop if provided (overriding internal computation)', () => {
      const { container } = render(
        <TaskCard 
          task={mockTask} 
          isActive={false} 
          isCompleted={false} 
          cardState="running"
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      // 'running' state should have 'bg-blue-50' class regardless of isActive/isCompleted
      expect(container.firstChild).toHaveClass('bg-blue-50');
    });
  });
});
