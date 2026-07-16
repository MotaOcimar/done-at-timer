// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutineImport } from './RoutineImport';
import { useTaskStore } from '../store/useTaskStore';
import { urlFragment } from '../utils/urlFragment';
import { encodeRoutinePayload } from '../utils/routineShare';

vi.mock('../store/useTaskStore', () => ({
  useTaskStore: vi.fn(),
}));

vi.mock('../utils/urlFragment', () => ({
  urlFragment: { readSharePayload: vi.fn(), clearFragment: vi.fn() },
}));

describe('RoutineImport', () => {
  const mockImportRoutine = vi.fn();
  const routine = {
    name: 'Morning Focus',
    tasks: [
      { title: 'Shower', expectedDuration: 10 },
      { title: 'Breakfast', expectedDuration: 20 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTaskStore as any).mockImplementation((selector: any) =>
      selector({ importRoutine: mockImportRoutine }),
    );
    (urlFragment.readSharePayload as any).mockReturnValue(
      encodeRoutinePayload(routine),
    );
  });

  it('renders nothing when the URL has no share fragment', () => {
    (urlFragment.readSharePayload as any).mockReturnValue(null);

    const { container } = render(<RoutineImport />);

    expect(container.firstChild).toBeNull();
    expect(urlFragment.clearFragment).not.toHaveBeenCalled();
  });

  it('previews the shared routine with name, tasks and total minutes', () => {
    render(<RoutineImport />);

    expect(screen.getByText(/Import shared routine\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Shower/i)).toBeInTheDocument();
    expect(screen.getByText(/Breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/2 tasks • 30m/i)).toBeInTheDocument();
    expect(mockImportRoutine).not.toHaveBeenCalled();
  });

  it('imports the routine and clears the fragment when confirmed', () => {
    render(<RoutineImport />);

    fireEvent.click(screen.getByRole('button', { name: /Import/i }));

    expect(mockImportRoutine).toHaveBeenCalledWith(
      'Morning Focus',
      routine.tasks,
    );
    expect(urlFragment.clearFragment).toHaveBeenCalled();
    expect(
      screen.queryByText(/Import shared routine\?/i),
    ).not.toBeInTheDocument();
  });

  it('imports nothing but still clears the fragment when cancelled', () => {
    render(<RoutineImport />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(mockImportRoutine).not.toHaveBeenCalled();
    expect(urlFragment.clearFragment).toHaveBeenCalled();
    expect(
      screen.queryByText(/Import shared routine\?/i),
    ).not.toBeInTheDocument();
  });

  it('shows an error for a corrupted payload and clears the fragment on dismiss', () => {
    (urlFragment.readSharePayload as any).mockReturnValue('corrupted!!');

    render(<RoutineImport />);

    expect(screen.getByText(/Can't import this link/i)).toBeInTheDocument();
    expect(screen.getByText(/corrupted or incomplete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));

    expect(mockImportRoutine).not.toHaveBeenCalled();
    expect(urlFragment.clearFragment).toHaveBeenCalled();
    expect(
      screen.queryByText(/Can't import this link/i),
    ).not.toBeInTheDocument();
  });

  it('shows a dedicated error for a payload from a newer app version', () => {
    // Version 2 payload, hand-built the same way the codec would
    const payload = btoa(
      JSON.stringify({ v: 2, name: 'X', tasks: [{ title: 'T', duration: 5 }] }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    (urlFragment.readSharePayload as any).mockReturnValue(payload);

    render(<RoutineImport />);

    expect(screen.getByText(/Can't import this link/i)).toBeInTheDocument();
    expect(screen.getByText(/newer version/i)).toBeInTheDocument();
  });
});
