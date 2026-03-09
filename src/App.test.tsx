// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders main sections', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /You will be done at/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open menu/i })).toBeInTheDocument();
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's next?/i)).toBeInTheDocument();
  });

  it('renders TaskInput after TaskList', () => {
    render(<App />);
    const taskListEmpty = screen.getByText(/No tasks yet/i);
    const taskInput = screen.getByPlaceholderText(/What's next?/i);

    // Check if taskInput is after taskListEmpty in the DOM
    const position = taskListEmpty.compareDocumentPosition(taskInput);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
