import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, Routine } from '../types';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

interface TaskState {
  tasks: Task[];
  activeTaskTimeLeft: number | null; // em segundos
  activeTaskId: string | null;
  targetEndTime: number | null; // timestamp
  totalElapsedBeforePause: number; // segundos
  isTimeUp: boolean;
  isNotificationsEnabled: boolean;
  routines: Routine[];
  addTask: (title: string, expectedDuration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTaskTimeLeft: (seconds: number | null) => void;
  startTask: (id: string) => void;
  pauseTask: () => void;
  resumeTask: () => void;
  onTimeUp: () => void;
  completeActiveTask: (timeLeftSeconds: number) => void;
  resetTasks: () => void;
  clearTasks: () => void;
  saveRoutine: (name: string) => void;
  importRoutine: (name: string, tasks: Routine['tasks']) => void;
  loadRoutine: (id: string) => void;
  deleteRoutine: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  toggleNotifications: () => void;
}

// Derives the runtime-only fields (never persisted) from the stored anchors:
// targetEndTime while running, the pause record while paused.
const deriveRuntimeState = (
  state: Pick<
    TaskState,
    'tasks' | 'activeTaskId' | 'targetEndTime' | 'totalElapsedBeforePause'
  >,
): Pick<TaskState, 'activeTaskTimeLeft' | 'isTimeUp'> => {
  const task = state.tasks.find((t) => t.id === state.activeTaskId);
  if (!task) return { activeTaskTimeLeft: null, isTimeUp: false };

  const remaining = state.targetEndTime
    ? Math.ceil((state.targetEndTime - Date.now()) / 1000)
    : Math.round(task.expectedDuration * 60 - state.totalElapsedBeforePause);

  return { activeTaskTimeLeft: remaining, isTimeUp: remaining <= 0 };
};

// The v0 snapshot shape: tasks/routines still name the estimate "duration",
// no startedAt, and the derived fields were persisted along.
interface PersistedV0 {
  tasks?: (Omit<Task, 'expectedDuration' | 'startedAt'> & {
    duration: number;
  })[];
  routines?: {
    id: string;
    name: string;
    tasks: { title: string; duration: number }[];
  }[];
  activeTaskId?: string | null;
  targetEndTime?: number | null;
  totalElapsedBeforePause?: number;
  isNotificationsEnabled?: boolean;
  activeTaskTimeLeft?: number | null;
  isTimeUp?: boolean;
}

const migrateV0 = (persisted: PersistedV0): Partial<TaskState> => {
  const { activeTaskTimeLeft: _timeLeft, isTimeUp: _up, ...rest } = persisted;

  const tasks: Task[] = (persisted.tasks ?? []).map(
    ({ duration, ...task }) => ({
      ...task,
      expectedDuration: duration,
      // The running task's anchor can be recovered exactly from the target it
      // was counting toward; a mid-pause snapshot has no target, so its
      // aborted anchor stays unknown (the field is display-only).
      startedAt:
        task.id === persisted.activeTaskId && persisted.targetEndTime
          ? persisted.targetEndTime - duration * 60 * 1000
          : undefined,
    }),
  );

  const routines: Routine[] = (persisted.routines ?? []).map((routine) => ({
    ...routine,
    tasks: routine.tasks.map(({ title, duration }) => ({
      title,
      expectedDuration: duration,
    })),
  }));

  return { ...rest, tasks, routines };
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskTimeLeft: null,
      activeTaskId: null,
      targetEndTime: null,
      totalElapsedBeforePause: 0,
      isTimeUp: false,
      isNotificationsEnabled: true,
      routines: [],
      addTask: (title, expectedDuration) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              expectedDuration,
              status: 'PENDING',
            },
          ],
        })),
      removeTask: (id) => {
        const state = get();
        const isActive = state.activeTaskId === id;
        const newTasks = state.tasks.filter((task) => task.id !== id);

        if (isActive) {
          const nextTask = newTasks.find((t) => t.status === 'PENDING');
          if (nextTask) {
            const finalTasks = newTasks.map((t) =>
              t.id === nextTask.id
                ? {
                    ...t,
                    status: 'IN_PROGRESS' as const,
                    startedAt: Date.now(),
                  }
                : t,
            );
            set({
              tasks: finalTasks,
              activeTaskId: nextTask.id,
              targetEndTime: Date.now() + nextTask.expectedDuration * 60 * 1000,
              totalElapsedBeforePause: 0,
              isTimeUp: false,
              activeTaskTimeLeft: nextTask.expectedDuration * 60,
            });
          } else {
            set({
              tasks: newTasks,
              activeTaskId: null,
              targetEndTime: null,
              totalElapsedBeforePause: 0,
              isTimeUp: false,
              activeTaskTimeLeft: null,
            });
          }
        } else {
          set({ tasks: newTasks });
        }
      },
      updateTask: (id, updates) =>
        set((state) => {
          let activeTaskId = state.activeTaskId;
          let targetEndTime = state.targetEndTime;
          let totalElapsedBeforePause = state.totalElapsedBeforePause;
          let isTimeUp = state.isTimeUp;
          const tasks = state.tasks;

          // If updating expectedDuration of the currently active task, adjust the target end time
          if (
            id === activeTaskId &&
            typeof updates.expectedDuration === 'number' &&
            targetEndTime
          ) {
            const oldTask = tasks.find((t) => t.id === id);
            if (oldTask) {
              const durationDiff =
                updates.expectedDuration - oldTask.expectedDuration;
              targetEndTime += durationDiff * 60 * 1000;
            }
          }

          let newTasks = tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          );

          if (updates.status === 'IN_PROGRESS') {
            activeTaskId = id;
            const task = newTasks.find((t) => t.id === id);
            if (task) {
              targetEndTime = Date.now() + task.expectedDuration * 60 * 1000;
              totalElapsedBeforePause = 0;
              isTimeUp = false;

              // Reorder: newly active task moves after all COMPLETED tasks
              // Ensure other tasks are not IN_PROGRESS. The started task gets
              // its run anchor; a demoted task's aborted run loses its anchor.
              const tasksWithCorrectStatus = newTasks.map((t) =>
                t.id === id
                  ? { ...t, startedAt: Date.now() }
                  : t.status === 'IN_PROGRESS'
                    ? { ...t, status: 'PENDING' as const, startedAt: undefined }
                    : t,
              );

              const completedTasks = tasksWithCorrectStatus.filter(
                (t) => t.status === 'COMPLETED',
              );
              const nonCompletedTasks = tasksWithCorrectStatus.filter(
                (t) => t.status !== 'COMPLETED',
              );

              const taskToStart = nonCompletedTasks.find((t) => t.id === id)!;
              const remainingNonCompleted = nonCompletedTasks.filter(
                (t) => t.id !== id,
              );

              newTasks = [
                ...completedTasks,
                taskToStart,
                ...remainingNonCompleted,
              ];
            }
          } else if (
            id === state.activeTaskId &&
            updates.status === 'COMPLETED'
          ) {
            activeTaskId = null;
            targetEndTime = null;
            totalElapsedBeforePause = 0;
            isTimeUp = false;
          }

          return {
            tasks: newTasks,
            activeTaskId,
            targetEndTime,
            totalElapsedBeforePause,
            isTimeUp,
          };
        }),
      setActiveTaskTimeLeft: (seconds) => set({ activeTaskTimeLeft: seconds }),
      startTask: (id) => {
        const { updateTask } = get();
        updateTask(id, { status: 'IN_PROGRESS' });
      },
      pauseTask: () => {
        const state = get();
        if (!state.targetEndTime) return;

        // Simplest approach: compute how much time REMAINS and subtract it from the total expectedDuration
        const task = state.tasks.find((t) => t.id === state.activeTaskId);
        if (!task) return;

        const remainingMs = Math.max(0, state.targetEndTime - Date.now());
        const elapsedMs = task.expectedDuration * 60 * 1000 - remainingMs;

        set({
          targetEndTime: null,
          totalElapsedBeforePause: elapsedMs / 1000,
        });
      },
      resumeTask: () => {
        const state = get();
        if (!state.activeTaskId || state.targetEndTime) return;

        const task = state.tasks.find((t) => t.id === state.activeTaskId);
        if (!task) return;

        const remainingSeconds =
          task.expectedDuration * 60 - state.totalElapsedBeforePause;

        set({
          targetEndTime: Date.now() + remainingSeconds * 1000,
        });
      },
      onTimeUp: () => {
        set({ isTimeUp: true });
      },
      completeActiveTask: (timeLeftSeconds) => {
        const state = get();
        const { activeTaskId, tasks } = state;
        if (!activeTaskId) return;

        const activeTaskOriginal = tasks.find((t) => t.id === activeTaskId);
        if (!activeTaskOriginal) return;

        // Calculate actual expectedDuration in minutes
        // actualSeconds = originalDurationSeconds - timeLeftSeconds (timeLeft is negative if overtime)
        const actualSeconds =
          activeTaskOriginal.expectedDuration * 60 - timeLeftSeconds;
        const actualDurationMinutes = Math.ceil(
          Math.max(0, actualSeconds) / 60,
        );

        // 1. Mark current task as COMPLETED and store actualDuration and completedAt
        const newTasks = tasks.map((t) =>
          t.id === activeTaskId
            ? {
                ...t,
                status: 'COMPLETED' as const,
                actualDuration: actualDurationMinutes,
                completedAt: Date.now(),
              }
            : t,
        );

        // 2. Find next PENDING task
        const nextTask = newTasks.find((t) => t.status === 'PENDING');

        if (nextTask) {
          // 3. Start next task
          const finalTasks = newTasks.map((t) =>
            t.id === nextTask.id
              ? { ...t, status: 'IN_PROGRESS' as const, startedAt: Date.now() }
              : t,
          );
          set({
            tasks: finalTasks,
            activeTaskId: nextTask.id,
            targetEndTime: Date.now() + nextTask.expectedDuration * 60 * 1000,
            totalElapsedBeforePause: 0,
            isTimeUp: false,
            activeTaskTimeLeft: nextTask.expectedDuration * 60,
          });
        } else {
          // No more tasks
          set({
            tasks: newTasks,
            activeTaskId: null,
            targetEndTime: null,
            totalElapsedBeforePause: 0,
            isTimeUp: false,
            activeTaskTimeLeft: null,
          });
        }
      },
      resetTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            status: 'PENDING',
            startedAt: undefined,
            completedAt: undefined,
            actualDuration: undefined,
          })),
          activeTaskTimeLeft: null,
          activeTaskId: null,
          targetEndTime: null,
          totalElapsedBeforePause: 0,
          isTimeUp: false,
        })),
      clearTasks: () =>
        set({
          tasks: [],
          activeTaskTimeLeft: null,
          activeTaskId: null,
          targetEndTime: null,
          totalElapsedBeforePause: 0,
          isTimeUp: false,
        }),
      saveRoutine: (name) => {
        const state = get();
        if (state.tasks.length === 0) return;

        const newRoutine: Routine = {
          id: generateId(),
          name,
          tasks: state.tasks.map(({ title, expectedDuration }) => ({
            title,
            expectedDuration,
          })),
        };

        set({ routines: [...state.routines, newRoutine] });
      },
      importRoutine: (name, tasks) => {
        const newRoutine: Routine = {
          id: generateId(),
          name,
          tasks: tasks.map(({ title, expectedDuration }) => ({
            title,
            expectedDuration,
          })),
        };

        set((state) => ({ routines: [...state.routines, newRoutine] }));
      },
      loadRoutine: (id) => {
        const state = get();
        const routine = state.routines.find((r) => r.id === id);
        if (!routine) return;

        const newTasks: Task[] = routine.tasks.map((t) => ({
          ...t,
          id: generateId(),
          status: 'PENDING',
        }));

        set({
          tasks: newTasks,
          activeTaskTimeLeft: null,
          activeTaskId: null,
          targetEndTime: null,
          totalElapsedBeforePause: 0,
          isTimeUp: false,
        });
      },
      deleteRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },
      reorderTasks: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
          const newIndex = state.tasks.findIndex((t) => t.id === overId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const activeTask = state.tasks[oldIndex];
            // Only PENDING tasks can be reordered
            if (activeTask.status !== 'PENDING') return state;

            // Find valid range for PENDING tasks (after COMPLETED and IN_PROGRESS)
            const firstPendingIndex = state.tasks.findIndex(
              (t) => t.status === 'PENDING',
            );
            let lastPendingIndex = state.tasks.length - 1;
            for (let i = state.tasks.length - 1; i >= 0; i--) {
              if (state.tasks[i].status === 'PENDING') {
                lastPendingIndex = i;
                break;
              }
            }

            // Clamp newIndex to pending range
            const clampedIndex = Math.max(
              firstPendingIndex,
              Math.min(lastPendingIndex, newIndex),
            );

            if (oldIndex !== clampedIndex) {
              return {
                tasks: arrayMove(state.tasks, oldIndex, clampedIndex),
              };
            }
          }

          return state;
        });
      },
      toggleNotifications: () =>
        set((state) => ({
          isNotificationsEnabled: !state.isNotificationsEnabled,
        })),
    }),
    {
      name: 'done-at-timer-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only sources of truth are persisted; activeTaskTimeLeft and isTimeUp
      // are derived from targetEndTime (or the pause record) on rehydrate.
      partialize: (state) => {
        const { activeTaskTimeLeft: _timeLeft, isTimeUp: _up, ...rest } = state;
        return rest;
      },
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<TaskState>) };
        return { ...merged, ...deriveRuntimeState(merged) };
      },
      migrate: (persisted, version) => {
        if (version === 0) {
          return migrateV0(persisted as PersistedV0);
        }
        return persisted;
      },
    },
  ),
);
