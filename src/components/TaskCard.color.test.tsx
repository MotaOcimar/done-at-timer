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
});
