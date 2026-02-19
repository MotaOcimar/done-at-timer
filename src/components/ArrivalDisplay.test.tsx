import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ArrivalDisplay from './ArrivalDisplay';
import { useTaskStore } from '../store/useTaskStore';

describe('ArrivalDisplay', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] });
    vi.useFakeTimers();
  });

  it('renders the arrival time correctly', () => {
    const now = new Date('2024-01-01T10:00:00');
    vi.setSystemTime(now);

    useTaskStore.setState({
      tasks: [
        { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' },
        { id: '2', title: 'Task 2', duration: 20, status: 'PENDING' },
      ],
    });

    render(<ArrivalDisplay />);
    
    // 10 + 20 = 30 mins from 10:00 -> 10:30
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('updates arrival time as time passes', () => {
    const now = new Date('2024-01-01T10:00:00');
    vi.setSystemTime(now);

    useTaskStore.setState({
      tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }],
    });

    render(<ArrivalDisplay />);
    expect(screen.getByText(/10:10/)).toBeInTheDocument();

    // Advance time by 5 minutes
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    // 10:05 + 10 mins = 10:15
    expect(screen.getByText(/10:15/)).toBeInTheDocument();
  });
});
