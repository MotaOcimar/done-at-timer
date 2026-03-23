// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

describe('TaskCard Color Refinements', () => {
  const mockTask: Task = { id: '1', title: 'Test Task', duration: 10, status: 'PENDING' };

  describe('Idle State (Pending)', () => {
    it('uses neutral color for the play button', () => {
      render(
        <TaskCard 
          task={mockTask} 
          isActive={false} 
          isCompleted={false} 
          cardState="idle"
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const playButton = screen.getByRole('button', { name: /Play task/i });
      expect(playButton).toHaveClass('bg-gray-100');
      expect(playButton).toHaveClass('text-gray-400');
      
      // Hover should be blue
      expect(playButton).toHaveClass('hover:bg-blue-50');
      expect(playButton).toHaveClass('hover:text-blue-500');
    });
  });

  describe('Paused State', () => {
    it('uses neutral (gray) color when an active task is paused', () => {
      render(
        <TaskCard 
          task={mockTask} 
          isActive={true} 
          isCompleted={false} 
          cardState="paused"
          isActuallyPaused={true}
          timeLeft={600} // 10 min left
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      const statusIconButton = screen.getByRole('button', { name: /Resume/i });
      const title = screen.getByRole('heading', { name: /Test Task/i });
      screen.getByText(/min total/i);
      screen.getByText(/10 min left/i);

      // Card should be neutral gray
      expect(card).toHaveClass('bg-gray-50');
      
      // Status icon button should be neutral gray
      expect(statusIconButton).toHaveClass('bg-gray-100');
      expect(statusIconButton).toHaveClass('text-gray-500');

      // Title and duration should be neutral gray
      expect(title).toHaveClass('text-gray-600');
      // The duration text is now inside a div that gets the labelClasses, and the div itself is the parent element found by text
      const durationElement = screen.getByText('10', { selector: 'span' }).closest('div.text-xs');
      expect(durationElement).toHaveClass('text-gray-400');

      // The time is now shown in the subtitle, so we check the whole div
      expect(screen.getByText(/total · 10 min left/i).closest('div.text-xs')).toHaveClass('text-gray-400');
    });
  });

  describe('Running State', () => {
    it('uses active blue colors when the task is running', () => {
      render(
        <TaskCard 
          task={mockTask} 
          isActive={true} 
          isCompleted={false} 
          cardState="running"
          isActuallyPaused={false}
          timeLeft={600} // 10 min left
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      const statusIconButton = screen.getByRole('button', { name: /Pause/i });
      const title = screen.getByRole('heading', { name: /Test Task/i });
      screen.getByText(/min total/i);
      screen.getByText(/10 min left/i);

      // Card should be active blue
      expect(card).toHaveClass('bg-blue-50');

      // Status icon button should be active blue
      expect(statusIconButton).toHaveClass('bg-blue-100');
      expect(statusIconButton).toHaveClass('text-blue-600');

      // Title and duration should be active blue
      expect(title).toHaveClass('text-blue-700');
      const durationElement = screen.getByText('10', { selector: 'span' }).closest('div.text-xs');
      expect(durationElement).toHaveClass('text-blue-400');

      // Time display should be active blue
      expect(screen.getByText(/total · 10 min left/i).closest('div.text-xs')).toHaveClass('text-blue-400');
    });
  });

  describe('Overtime State', () => {
    it('uses a softer amber tone when the task is in overtime', () => {
      const { container } = render(
        <TaskCard 
          task={mockTask} 
          isActive={true} 
          isCompleted={false} 
          cardState="overtime"
          isTimeUp={true}
          timeLeft={-60} // 1 min over
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      
      const title = screen.getByRole('heading', { name: /Test Task/i });
      screen.getByText(/min total/i);
      const doneButton = screen.getByRole('button', { name: /Done/i });
      screen.getByText(/1 min over/i);

      // Card should be softer amber
      expect(card).toHaveClass('bg-amber-50');
      expect(card).not.toHaveClass('border-amber-500');

      // Status icon should be softer amber - currently it's bg-amber-100 text-amber-600
      const statusIconDiv = container.querySelector('div.flex.items-center.justify-center.w-10.h-10.rounded-full');
      expect(statusIconDiv).toHaveClass('text-amber-500');
      expect(statusIconDiv).not.toHaveClass('text-amber-600');

      // Title and duration should be softer amber - currently it's just 'text-amber-600' and 'text-amber-400'
      expect(title).toHaveClass('text-amber-600');
      const durationElement = screen.getByText('10', { selector: 'span' }).closest('div.text-xs');
      expect(durationElement).toHaveClass('text-amber-400');

      // Done button should be softer - currently bg-amber-500
      expect(doneButton).toHaveClass('bg-amber-400');
      expect(doneButton).not.toHaveClass('bg-amber-500');

      // Time display should be softer - currently text-amber-500
      expect(screen.getByText(/total · 1 min over/i).closest('div.text-xs')).toHaveClass('text-amber-400');
    });
  });

  describe('Completed State', () => {
    it('uses an "Ultra Soft Green" design (no global opacity-70) for a very subtle "mission accomplished" feel', () => {
      const mockEta = new Date();
      mockEta.setHours(12, 0, 0);
      
      render(
        <TaskCard 
          task={{ ...mockTask, status: 'COMPLETED', actualDuration: 12 }} 
          isActive={false} 
          isCompleted={true} 
          cardState="completed"
          eta={mockEta}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      const title = screen.getByRole('heading', { name: /Test Task/i });
      const durationElement = screen.getByText('10', { selector: 'span' }).closest('div.text-xs');
      const actualDurationElement = screen.getByText(/took 12 min/i);

      // Card should NOT have global opacity-70
      expect(card).not.toHaveClass('opacity-70');
      
      // Card should be ultra soft green
      expect(card).toHaveClass('bg-green-50/50');

      // Title should be very muted green and line-through
      expect(title).toHaveClass('text-green-800/40');
      expect(title).toHaveClass('line-through');

      // Labels (duration) should be extremely muted green
      expect(durationElement).toHaveClass('text-green-700/30');
      
      // Actual duration and ETA should be more visible green
      expect(actualDurationElement).toHaveClass('text-green-700/50');
      const etaElement = screen.getByText(/12:00/i).closest('span');
      expect(etaElement).toHaveClass('text-green-700/60');
    });
  });
});
