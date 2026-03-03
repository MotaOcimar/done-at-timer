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
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const playButton = screen.getByRole('button', { name: /Play task/i });
      
      // These should fail currently as they are bg-blue-50 and text-blue-500
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
          isActuallyPaused={true}
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      const statusIconButton = screen.getByRole('button', { name: /Resume/i });
      const title = screen.getByRole('heading', { name: /Test Task/i });
      const durationLabel = screen.getByText(/min total/i);

      // Card should be neutral gray - currently it's blue
      expect(card).toHaveClass('border-gray-300');
      expect(card).toHaveClass('bg-gray-50');
      expect(card).not.toHaveClass('border-blue-500');

      // Status icon should be neutral gray - currently it's blue
      expect(statusIconButton).toHaveClass('bg-gray-100');
      expect(statusIconButton).toHaveClass('text-gray-500');

      // Title and duration should be neutral gray - currently they are blue
      expect(title).toHaveClass('text-gray-600');
      expect(durationLabel).toHaveClass('text-gray-400');
    });
  });

  describe('Overtime State', () => {
    it('uses a softer amber tone when the task is in overtime', () => {
      const { container } = render(
        <TaskCard 
          task={mockTask} 
          isActive={true} 
          isCompleted={false} 
          isTimeUp={true}
          timeLeft={-60} // 1 min over
          onDelete={vi.fn()}
          onToggle={vi.fn()}
          onTitleSave={vi.fn()}
          onDurationSave={vi.fn()}
          onComplete={vi.fn()}
        />
      );
      
      const card = screen.getByRole('heading', { name: /Test Task/i }).closest('div.flex-col');
      
      const title = screen.getByRole('heading', { name: /Test Task/i });
      const durationLabel = screen.getByText(/min total/i);
      const doneButton = screen.getByRole('button', { name: /Done/i });
      const timeDisplay = screen.getByText(/1 min over/i);

      // Card should be softer amber - currently it's border-amber-500
      expect(card).toHaveClass('border-amber-300');
      expect(card).toHaveClass('bg-amber-50');
      expect(card).not.toHaveClass('border-amber-500');

      // Status icon should be softer amber - currently it's bg-amber-100 text-amber-600
      const statusIconDiv = container.querySelector('div.flex.items-center.justify-center.w-10.h-10.rounded-full');
      expect(statusIconDiv).toHaveClass('text-amber-500');
      expect(statusIconDiv).not.toHaveClass('text-amber-600');

      // Title and duration should be softer amber - currently text-amber-700 and text-amber-400
      expect(title).toHaveClass('text-amber-600');
      expect(durationLabel).toHaveClass('text-amber-400');

      // Done button should be softer - currently bg-amber-500
      expect(doneButton).toHaveClass('bg-amber-400');
      expect(doneButton).not.toHaveClass('bg-amber-500');

      // Time display should be softer - currently text-amber-600
      expect(timeDisplay).toHaveClass('text-amber-500');
    });
  });
});
