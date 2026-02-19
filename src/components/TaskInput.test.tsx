import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import TaskInput from './TaskInput';
import { useTaskStore } from '../store/useTaskStore';

describe('TaskInput', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
  });

  it('adds task to store on submit', () => {
    render(<TaskInput />);
    
    const nameInput = screen.getByPlaceholderText(/Task name/i);
    const durationInput = screen.getByPlaceholderText(/Duration \(min\)/i);
    const addButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(nameInput, { target: { value: 'New Task' } });
    fireEvent.change(durationInput, { target: { value: '15' } });
    fireEvent.click(addButton);

    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('New Task');
    expect(tasks[0].duration).toBe(15);
  });
});
