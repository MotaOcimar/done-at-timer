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
});
