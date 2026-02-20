import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task } from '../types';

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
  addTask: (title: string, duration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTaskTimeLeft: (seconds: number | null) => void;
  startTask: (id: string) => void;
  pauseTask: () => void;
  resumeTask: () => void;
  resetTasks: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskTimeLeft: null,
      activeTaskId: null,
      targetEndTime: null,
      totalElapsedBeforePause: 0,
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
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          );
          
          let activeTaskId = state.activeTaskId;
          let targetEndTime = state.targetEndTime;
          let totalElapsedBeforePause = state.totalElapsedBeforePause;

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
    }),
    {
      name: 'done-at-timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
