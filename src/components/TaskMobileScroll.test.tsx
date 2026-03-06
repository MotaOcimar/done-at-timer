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

  it('main container should NOT have touch-action: none', () => {
    const { container } = render(<TaskItem task={task} onDelete={vi.fn()} />);
    // container.firstChild is the main TaskCard div
    const cardDiv = container.firstChild as HTMLElement;
    
    // CURRENTLY THIS WILL FAIL if our goal is to REMOVE it from here
    expect(cardDiv.style.touchAction).not.toBe('none');
  });

  it('drag handle SHOULD have touch-action: none for reliable dragging', () => {
    render(<TaskItem task={task} onDelete={vi.fn()} />);
    const handle = screen.getByLabelText(/drag to reorder/i);
    
    // CURRENTLY THIS WILL FAIL if it's not applied there yet
    expect(handle.style.touchAction).toBe('none');
  });
});
