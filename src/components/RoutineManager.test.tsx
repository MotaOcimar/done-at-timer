// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutineManager } from './RoutineManager';
import { useTaskStore } from '../store/useTaskStore';

// Mock the task store
vi.mock('../store/useTaskStore', () => ({
  useTaskStore: vi.fn(),
}));

describe('RoutineManager', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }
  ];
  const mockRoutines = [
    { id: 'r1', name: 'Morning Routine', tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }] }
  ];

  const mockSaveRoutine = vi.fn();
  const mockLoadRoutine = vi.fn();
  const mockDeleteRoutine = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTaskStore as any).mockImplementation((selector: any) => 
      selector({
        tasks: mockTasks,
        routines: mockRoutines,
        saveRoutine: mockSaveRoutine,
        loadRoutine: mockLoadRoutine,
        deleteRoutine: mockDeleteRoutine,
      })
    );
  });

  it('should not render anything when closed', () => {
    const { container } = render(<RoutineManager isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the drawer when open', () => {
    render(<RoutineManager isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Your Routines/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning Routine/i)).toBeInTheDocument();
  });

  it('should render the save modal when isSavingExternal is true', () => {
    render(<RoutineManager isOpen={false} isSavingExternal={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Save Routine/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., Morning Focus/i)).toBeInTheDocument();
  });

  it('should call saveRoutine when submitting the save form', () => {
    render(<RoutineManager isOpen={false} isSavingExternal={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/e.g., Morning Focus/i);
    const saveButton = screen.getByRole('button', { name: /Save/i });

    fireEvent.change(input, { target: { value: 'New Routine' } });
    fireEvent.click(saveButton);

    expect(mockSaveRoutine).toHaveBeenCalledWith('New Routine');
  });

  it('should show confirmation when trying to load a routine with existing tasks', () => {
    render(<RoutineManager isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    expect(screen.getByText(/Replace current tasks\?/i)).toBeInTheDocument();
  });

  it('should call loadRoutine when confirming load', () => {
    render(<RoutineManager isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    const loadButton = screen.getByRole('button', { name: /Yes, Load/i });
    fireEvent.click(loadButton);

    expect(mockLoadRoutine).toHaveBeenCalledWith('r1');
  });

  it('should show confirmation when trying to delete a routine', () => {
    render(<RoutineManager isOpen={true} onClose={vi.fn()} />);
    const deleteButton = screen.getByLabelText(/Delete routine/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Delete this routine\?/i)).toBeInTheDocument();
  });
});
