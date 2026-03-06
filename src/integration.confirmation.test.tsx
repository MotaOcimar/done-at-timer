import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from './App';
import { useTaskStore } from './store/useTaskStore';

describe('Manual Confirmation Integration', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
    vi.useFakeTimers();
  });

  it('Task 1 finishes -> stays ACTIVE/isTimeUp -> User clicks Done -> Task 2 starts', async () => {
    useTaskStore.getState().addTask('Task 1', 1); // 1 min
    useTaskStore.getState().addTask('Task 2', 2);

    render(<App />);

    // Start Task 1
    const playButtons = screen.getAllByRole('button', { name: /Play task/i });
    fireEvent.click(playButtons[0]);

    expect(useTaskStore.getState().tasks[0].status).toBe('IN_PROGRESS');
    expect(useTaskStore.getState().isTimeUp).toBe(false);

    // Fast forward 1 minute (60 seconds)
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Verify isTimeUp is now true in store
    expect(useTaskStore.getState().isTimeUp).toBe(true);
    
    // Task 1 should still be IN_PROGRESS (not COMPLETED yet)
    expect(useTaskStore.getState().tasks[0].status).toBe('IN_PROGRESS');

    // UI should show Done button (prominent one for TimeUp)
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    expect(doneBtn).toBeInTheDocument();

    // Click Done
    fireEvent.click(doneBtn);

    // Task 1 should be COMPLETED, Task 2 should be IN_PROGRESS
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
    expect(tasks[1].status).toBe('IN_PROGRESS');
    expect(useTaskStore.getState().isTimeUp).toBe(false);
  });
});
