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
    const stickyHeader = arrivalDisplayText.closest('.sticky');

    // Check for the layered structure
    const mask = stickyHeader?.querySelector('.absolute');
    expect(mask).toBeInTheDocument();

    const timerLayer = stickyHeader?.querySelector('.relative.z-10');
    expect(timerLayer).toBeInTheDocument();
    expect(timerLayer).toHaveClass('pb-28');
    expect(timerLayer).toHaveClass('-mb-28');

    // Check for neblina (gradient fade)
    const neblina = stickyHeader?.querySelector('.bg-gradient-to-b');
    expect(neblina).toBeInTheDocument();
    expect(neblina).toHaveClass('h-28');
  });
});
