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
    // Find the sticky container. We expect it to be a parent of the text.
    const stickyContainer = arrivalDisplayText.closest('.sticky');

    expect(stickyContainer).toBeInTheDocument();
    expect(stickyContainer).toHaveClass('top-0');
    expect(stickyContainer).toHaveClass('z-50');
  });

  it('has sufficient padding and a neblina to prevent shadow clipping', () => {
    useTaskStore.getState().addTask('Task 1', 10);
    render(<App />);

    const arrivalDisplayText = screen.getByText(/You will be done at/i);
    const stickyContainer = arrivalDisplayText.closest('.sticky');

    // Check for increased padding to accommodate shadow
    expect(stickyContainer).toHaveClass('pb-12');
    expect(stickyContainer).toHaveClass('-mb-12');

    // Check for neblina (gradient fade)
    const neblina = stickyContainer?.querySelector('.bg-gradient-to-t');
    expect(neblina).toBeInTheDocument();
    expect(neblina).toHaveClass('h-24');
  });
});
