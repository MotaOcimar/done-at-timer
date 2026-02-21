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
  routines: Routine[];
  addTask: (title: string, duration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTaskTimeLeft: (seconds: number | null) => void;
  startTask: (id: string) => void;
  pauseTask: () => void;
  resumeTask: () => void;
  resetTasks: () => void;
  clearTasks: () => void;
  saveRoutine: (name: string) => void;
  loadRoutine: (id: string) => void;
  deleteRoutine: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskTimeLeft: null,
      activeTaskId: null,
      targetEndTime: null,
      totalElapsedBeforePause: 0,
      routines: [],
      addTask: (title, duration) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              duration,
              status: 'PENDING',
            },
          ],
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
          targetEndTime: state.activeTaskId === id ? null : state.targetEndTime,
        })),
      updateTask: (id, updates) =>
        set((state) => {
          let activeTaskId = state.activeTaskId;
          let targetEndTime = state.targetEndTime;
          let totalElapsedBeforePause = state.totalElapsedBeforePause;

          // If updating duration of the currently active task, adjust the target end time
          if (
            id === activeTaskId &&
            typeof updates.duration === 'number' &&
            targetEndTime
          ) {
            const oldTask = state.tasks.find((t) => t.id === id);
            if (oldTask) {
              const durationDiff = updates.duration - oldTask.duration;
              targetEndTime += durationDiff * 60 * 1000;
            }
          }

          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          );

          if (updates.status === 'IN_PROGRESS') {
            activeTaskId = id;
            const task = newTasks.find(t => t.id === id);
            if (task) {
              targetEndTime = Date.now() + (task.duration * 60 * 1000);
              totalElapsedBeforePause = 0;
            }
          } else if (id === state.activeTaskId && updates.status) {
            activeTaskId = null;
            targetEndTime = null;
            totalElapsedBeforePause = 0;
          }

          return {
            tasks: newTasks,
            activeTaskId,
            targetEndTime,
            totalElapsedBeforePause
          };
        }),
      setActiveTaskTimeLeft: (seconds) => set({ activeTaskTimeLeft: seconds }),
      startTask: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;

        // Se já houver uma tarefa ativa, marcamos como PENDING (ou pausada se preferir)
        // Por enquanto, seguimos o modelo de playlist: iniciar uma nova substitui a atual.
        const newTasks = state.tasks.map((t) => {
          if (t.id === id) return { ...t, status: 'IN_PROGRESS' as const };
          if (t.status === 'IN_PROGRESS') return { ...t, status: 'PENDING' as const };
          return t;
        });

        set({
          tasks: newTasks,
          activeTaskId: id,
          targetEndTime: Date.now() + task.duration * 60 * 1000,
          totalElapsedBeforePause: 0,
        });
      },
      pauseTask: () => {
        const state = get();
        if (!state.targetEndTime) return;
        
        // Forma mais simples: calcular quanto tempo RESTA e subtrair da duração total
        const task = state.tasks.find(t => t.id === state.activeTaskId);
        if (!task) return;

        const remainingMs = Math.max(0, state.targetEndTime - Date.now());
        const elapsedMs = (task.duration * 60 * 1000) - remainingMs;

        set({
          targetEndTime: null,
          totalElapsedBeforePause: elapsedMs / 1000,
        });
      },
      resumeTask: () => {
        const state = get();
        if (!state.activeTaskId || state.targetEndTime) return;

        const task = state.tasks.find(t => t.id === state.activeTaskId);
        if (!task) return;

        const remainingSeconds = (task.duration * 60) - state.totalElapsedBeforePause;
        
        set({
          targetEndTime: Date.now() + (remainingSeconds * 1000),
        });
      },
      resetTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((task) => ({ ...task, status: 'PENDING' })),
          activeTaskTimeLeft: null,
          activeTaskId: null,
          targetEndTime: null,
          totalElapsedBeforePause: 0,
        })),
      clearTasks: () =>
        set({
          tasks: [],
          activeTaskTimeLeft: null,
          activeTaskId: null,
          targetEndTime: null,
          totalElapsedBeforePause: 0,
        }),
      saveRoutine: (name) => {
        const state = get();
        if (state.tasks.length === 0) return;

        const newRoutine: Routine = {
          id: generateId(),
          name,
          tasks: state.tasks.map(({ title, duration }) => ({ title, duration })),
        };

        set({ routines: [...state.routines, newRoutine] });
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
            return {
              tasks: arrayMove(state.tasks, oldIndex, newIndex),
            };
          }

          return state;
        });
      },
    }),
    {
      name: 'done-at-timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
