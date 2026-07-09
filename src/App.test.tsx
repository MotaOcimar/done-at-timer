// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { App } from './App';
import { encodeRoutinePayload } from './utils/routineShare';

describe('App', () => {
  afterEach(() => {
    location.hash = '';
  });

  it('renders main sections', () => {
    render(<App />);
    expect(screen.getByLabelText(/locked/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Open menu/i }),
    ).toBeInTheDocument();
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

  it('shows the shared-routine import preview when the URL carries a share fragment', () => {
    location.hash = `#r=${encodeRoutinePayload({
      name: 'Shared Routine',
      tasks: [{ title: 'Stretch', duration: 5 }],
    })}`;

    render(<App />);

    expect(screen.getByText(/Import shared routine\?/i)).toBeInTheDocument();
    expect(screen.getByText('Shared Routine')).toBeInTheDocument();
  });
});
