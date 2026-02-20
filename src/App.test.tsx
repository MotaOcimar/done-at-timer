import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders main sections', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /You will be done at/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Plan your routine/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's next?/i)).toBeInTheDocument();
  });

  it('renders TaskInput after TaskList', () => {
    render(<App />);
    const taskListHeader = screen.getByRole('heading', { name: /Plan your routine/i });
    const taskInput = screen.getByPlaceholderText(/What's next?/i);

    // Check if taskInput is after taskListHeader in the DOM
    // compareDocumentPosition returns a bitmask. 4 means "following"
    const position = taskListHeader.compareDocumentPosition(taskInput);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
