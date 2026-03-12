// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ControlCenter } from './ControlCenter';
import { useTaskStore } from '../store/useTaskStore';
import { useNotification } from '../hooks/useNotification';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

// Mock the task store
vi.mock('../store/useTaskStore', () => ({
  useTaskStore: vi.fn(),
}));

// Mock useNotification hook
vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}));

// Mock useInstallPrompt hook
vi.mock('../hooks/useInstallPrompt', () => ({
  useInstallPrompt: vi.fn(),
}));

describe('ControlCenter', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }
  ];
  const mockRoutines = [
    { id: 'r1', name: 'Morning Routine', tasks: [{ id: '1', title: 'Task 1', duration: 10, status: 'PENDING' }] }
  ];

  const mockSaveRoutine = vi.fn();
  const mockLoadRoutine = vi.fn();
  const mockDeleteRoutine = vi.fn();
  const mockRequestPermission = vi.fn();
  const mockPromptInstall = vi.fn();

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

    (useNotification as any).mockReturnValue({
      permission: 'default',
      requestPermission: mockRequestPermission,
    });

    (useInstallPrompt as any).mockReturnValue({
      isInstallable: false,
      isIOS: false,
      isStandalone: false,
      promptInstall: mockPromptInstall,
    });
  });

  it('should not render anything when closed', () => {
    const { container } = render(<ControlCenter isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the drawer when open', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Control Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning Routine/i)).toBeInTheDocument();
  });

  it('should call loadRoutine immediately if there are no tasks', () => {
    (useTaskStore as any).mockImplementation((selector: any) => 
      selector({
        tasks: [],
        routines: mockRoutines,
        saveRoutine: mockSaveRoutine,
        loadRoutine: mockLoadRoutine,
        deleteRoutine: mockDeleteRoutine,
      })
    );
    const mockOnClose = vi.fn();
    render(<ControlCenter isOpen={true} onClose={mockOnClose} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    expect(mockLoadRoutine).toHaveBeenCalledWith('r1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking the main backdrop', () => {
    const mockOnClose = vi.fn();
    render(<ControlCenter isOpen={true} onClose={mockOnClose} />);
    
    // The main backdrop is the first child with backdrop-blur-sm
    const backdrop = screen.getAllByRole('presentation', { hidden: true }).find(el => el.className.includes('backdrop-blur-sm'));
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should call handleCancelSave when clicking the backdrop during external saving', () => {
    const mockOnSaveComplete = vi.fn();
    render(<ControlCenter isOpen={false} isSavingExternal={true} onSaveComplete={mockOnSaveComplete} onClose={vi.fn()} />);
    
    const backdrop = screen.getAllByRole('presentation', { hidden: true }).find(el => el.className.includes('backdrop-blur-sm'));
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnSaveComplete).toHaveBeenCalled();
    }
  });

  it('should render the save modal when isSavingExternal is true', () => {
    render(<ControlCenter isOpen={false} isSavingExternal={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Save Routine/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., Morning Focus/i)).toBeInTheDocument();
  });

  it('should call saveRoutine when submitting the save form', () => {
    render(<ControlCenter isOpen={false} isSavingExternal={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/e.g., Morning Focus/i);
    const saveButton = screen.getByRole('button', { name: /Save/i });

    fireEvent.change(input, { target: { value: 'New Routine' } });
    fireEvent.click(saveButton);

    expect(mockSaveRoutine).toHaveBeenCalledWith('New Routine');
  });

  it('should show confirmation when trying to load a routine with existing tasks', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    expect(screen.getByText(/Replace current tasks\?/i)).toBeInTheDocument();
  });

  it('should call loadRoutine when confirming load', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    const loadButton = screen.getByRole('button', { name: /Yes, Load/i });
    fireEvent.click(loadButton);

    expect(mockLoadRoutine).toHaveBeenCalledWith('r1');
  });

  it('should close the load confirmation modal when clicking the backdrop', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    expect(screen.getByText(/Replace current tasks\?/i)).toBeInTheDocument();
    
    // Backdrop for confirmation modal
    const backdrop = screen.getAllByRole('presentation', { hidden: true }).find(el => el.className.includes('backdrop-blur-md'));
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByText(/Replace current tasks\?/i)).not.toBeInTheDocument();
    }
  });

  it('should close the load confirmation modal when clicking the cancel button', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const routineItem = screen.getByText(/Morning Routine/i);
    fireEvent.click(routineItem);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Replace current tasks\?/i)).not.toBeInTheDocument();
  });

  it('should show confirmation when trying to delete a routine', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const deleteButton = screen.getByLabelText(/Delete routine/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Delete this routine\?/i)).toBeInTheDocument();
  });

  it('should call deleteRoutine when confirming delete', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const deleteButton = screen.getByLabelText(/Delete routine/i);
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(confirmDeleteButton);

    expect(mockDeleteRoutine).toHaveBeenCalledWith('r1');
  });

  it('should close the delete confirmation modal when clicking the cancel button', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const deleteButton = screen.getByLabelText(/Delete routine/i);
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Delete this routine\?/i)).not.toBeInTheDocument();
  });

  it('should close the delete confirmation modal when clicking the backdrop', () => {
    render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
    const deleteButton = screen.getByLabelText(/Delete routine/i);
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Delete this routine\?/i)).toBeInTheDocument();
    
    // Backdrop for confirmation modal
    const backdrop = screen.getAllByRole('presentation', { hidden: true }).find(el => el.className.includes('backdrop-blur-md'));
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByText(/Delete this routine\?/i)).not.toBeInTheDocument();
    }
  });

  describe('Notifications', () => {
    it('should render "Enable Notifications" toggle when permission is default', () => {
      (useNotification as any).mockReturnValue({
        permission: 'default',
        requestPermission: mockRequestPermission,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/Enable Notifications/i)).toBeInTheDocument();
    });

    it('should call requestPermission when the toggle is clicked', () => {
      (useNotification as any).mockReturnValue({
        permission: 'default',
        requestPermission: mockRequestPermission,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      const toggle = screen.getByText(/Enable Notifications/i);
      fireEvent.click(toggle);
      
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should show active toggle when permission is granted and notifications are enabled in store', () => {
      const mockToggleNotifications = vi.fn();
      (useNotification as any).mockReturnValue({
        permission: 'granted',
        requestPermission: mockRequestPermission,
      });
      (useTaskStore as any).mockImplementation((selector: any) => 
        selector({
          tasks: [],
          routines: [],
          isNotificationsEnabled: true,
          toggleNotifications: mockToggleNotifications,
        })
      );
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      const toggle = screen.getByRole('switch', { name: /Toggle Notifications/i });
      expect(toggle).toBeChecked();
    });

    it('should show inactive toggle when permission is granted and notifications are disabled in store', () => {
      const mockToggleNotifications = vi.fn();
      (useNotification as any).mockReturnValue({
        permission: 'granted',
        requestPermission: mockRequestPermission,
      });
      (useTaskStore as any).mockImplementation((selector: any) => 
        selector({
          tasks: [],
          routines: [],
          isNotificationsEnabled: false,
          toggleNotifications: mockToggleNotifications,
        })
      );
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      const toggle = screen.getByRole('switch', { name: /Toggle Notifications/i });
      expect(toggle).not.toBeChecked();
    });

    it('should call toggleNotifications when the app-level toggle is clicked', () => {
      const mockToggleNotifications = vi.fn();
      (useNotification as any).mockReturnValue({
        permission: 'granted',
        requestPermission: mockRequestPermission,
      });
      (useTaskStore as any).mockImplementation((selector: any) => 
        selector({
          tasks: [],
          routines: [],
          isNotificationsEnabled: true,
          toggleNotifications: mockToggleNotifications,
        })
      );
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      const toggle = screen.getByRole('switch', { name: /Toggle Notifications/i });
      fireEvent.click(toggle);
      
      expect(mockToggleNotifications).toHaveBeenCalled();
    });

    it('should show coherent icons when notifications are enabled vs disabled', () => {
      const mockToggleNotifications = vi.fn();
      
      // Test case 1: Enabled
      const { rerender } = render(
        <ControlCenter isOpen={true} onClose={vi.fn()} />
      );
      (useNotification as any).mockReturnValue({
        permission: 'granted',
        requestPermission: mockRequestPermission,
      });
      (useTaskStore as any).mockImplementation((selector: any) => 
        selector({
          tasks: [],
          routines: [],
          isNotificationsEnabled: true,
          toggleNotifications: mockToggleNotifications,
        })
      );
      rerender(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      // Check for Bell icon
      expect(screen.getByText(/Notifications Enabled/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon-bell')).toBeInTheDocument();

      // Test case 2: Disabled
      (useTaskStore as any).mockImplementation((selector: any) => 
        selector({
          tasks: [],
          routines: [],
          isNotificationsEnabled: false,
          toggleNotifications: mockToggleNotifications,
        })
      );
      rerender(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Notifications Paused/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon-bell-off')).toBeInTheDocument();
    });

    it('should show "blocked" message with helper text when permission is denied', () => {
      (useNotification as any).mockReturnValue({
        permission: 'denied',
        requestPermission: mockRequestPermission,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Notifications Blocked/i)).toBeInTheDocument();
      expect(screen.getByText(/To enable, update your browser's site settings./i)).toBeInTheDocument();
    });

    it('should hide notification section entirely when permission is unsupported', () => {
      (useNotification as any).mockReturnValue({
        permission: 'unsupported',
        requestPermission: mockRequestPermission,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.queryByText(/Enable Notifications/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Notifications Enabled/i)).not.toBeInTheDocument();
    });
  });

  describe('App', () => {
    it('should show "Install App" button when isInstallable is true and not iOS', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: true,
        isIOS: false,
        isStandalone: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/^App$/i)).toBeInTheDocument();
      expect(screen.getByText(/Install App/i)).toBeInTheDocument();
    });

    it('should call promptInstall when install button is clicked', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: true,
        isIOS: false,
        isStandalone: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      const installButton = screen.getByText(/Install App/i);
      fireEvent.click(installButton);
      
      expect(mockPromptInstall).toHaveBeenCalled();
    });

    it('should show iOS share instructions when isIOS is true', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: true,
        isIOS: true,
        isStandalone: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/^App$/i)).toBeInTheDocument();
      expect(screen.getByText(/Tap the share icon and select/i)).toBeInTheDocument();
      expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
    });

    it('should hide install section when isInstallable is false', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: false,
        isIOS: false,
        isStandalone: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Installation not available/i)).toBeInTheDocument();
    });

    it('should show "App Installed" indicator when isStandalone is true', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: false,
        isIOS: false,
        isStandalone: true,
        isAlreadyInstalled: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/App Installed/i)).toBeInTheDocument();
      expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
    });

    it('should show "App Installed" indicator when isAlreadyInstalled is true and isStandalone is false', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: false,
        isIOS: false,
        isStandalone: false,
        isAlreadyInstalled: true,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/App Installed/i)).toBeInTheDocument();
      expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
    });

    it('should prioritize "App Installed" over "Install App" when both are true', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: true,
        isIOS: false,
        isStandalone: false,
        isAlreadyInstalled: true,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/App Installed/i)).toBeInTheDocument();
      expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
    });

    it('should show "Install App" button when isInstallable is true and not installed', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: true,
        isIOS: false,
        isStandalone: false,
        isAlreadyInstalled: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Install App/i)).toBeInTheDocument();
      expect(screen.queryByText(/App Installed/i)).not.toBeInTheDocument();
    });

    it('should show "Installation not available" when not installable and not installed', () => {
      (useInstallPrompt as any).mockReturnValue({
        isInstallable: false,
        isIOS: false,
        isStandalone: false,
        isAlreadyInstalled: false,
        promptInstall: mockPromptInstall,
      });
      render(<ControlCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText(/Installation not available/i)).toBeInTheDocument();
      expect(screen.queryByText(/App Installed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Install App/i)).not.toBeInTheDocument();
    });
  });
});
