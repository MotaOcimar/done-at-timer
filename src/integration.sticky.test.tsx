import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './App';
import { useTaskStore } from './store/useTaskStore';

describe('Sticky Arrival Display Integration', () => {
  beforeEach(() => {
    useTaskStore.getState().clearTasks();
  });

  it('renders the ArrivalDisplay within a sticky container', () => {
    useTaskStore.getState().addTask('Task 1', 10);
    render(<App />);

    const arrivalDisplayText = screen.getByText(/You will be done at/i);
    const stickyContainer = arrivalDisplayText.closest('.sticky');

    expect(stickyContainer).toBeInTheDocument();
    expect(stickyContainer).toHaveClass('top-0');
    expect(stickyContainer).toHaveClass('z-50');
    expect(stickyContainer).toHaveClass('bg-gray-50');
  });
});
