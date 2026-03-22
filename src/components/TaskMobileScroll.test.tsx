// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      attributes: { 'data-testid': 'sortable-attributes' },
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    })),
  };
});

describe('Task Mobile Scroll Fix', () => {
  const task: Task = { id: '1', title: 'Test Task', duration: 30, status: 'PENDING' };

  it('main container should have touch-action: pan-y for horizontal swipe compatibility', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    // The container with sortable attributes (task-item-container) should have pan-y
    const container = screen.getByTestId('task-item-container');
    
    expect(container.style.touchAction).toBe('pan-y');
  });
});
