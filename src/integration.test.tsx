import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { useTaskStore } from './store/useTaskStore';

describe('Sequential Execution Integration', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
  });

  it('allows starting the routine and progresses through tasks', async () => {
    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });

    render(<App />);

    // Start Routine button should exist when tasks are pending
    const startBtn = screen.getByRole('button', { name: /Start Routine/i });
    fireEvent.click(startBtn);

    // Task 1 should be IN_PROGRESS
    expect(useTaskStore.getState().tasks[0].status).toBe('IN_PROGRESS');
    expect(screen.getByText('Working On')).toBeInTheDocument();
    // Use getAllByText and check the one in ActiveTask (heading level 2)
    const task1Titles = screen.getAllByText('Task 1');
    expect(task1Titles.some(el => el.tagName === 'H2')).toBe(true);

    // Mark as Done
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);

    // Task 1 should be COMPLETED, Task 2 should be IN_PROGRESS
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].status).toBe('COMPLETED');
    expect(tasks[1].status).toBe('IN_PROGRESS');

    const task2Titles = screen.getAllByText('Task 2');
    expect(task2Titles.some(el => el.tagName === 'H2')).toBe(true);
  });
});
