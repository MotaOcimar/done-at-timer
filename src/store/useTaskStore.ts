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
  addTask: (title: string, duration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTaskTimeLeft: (seconds: number | null) => void;
  resetTasks: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      activeTaskTimeLeft: null,
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
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      setActiveTaskTimeLeft: (seconds) => set({ activeTaskTimeLeft: seconds }),
      resetTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((task) => ({ ...task, status: 'PENDING' })),
          activeTaskTimeLeft: null,
        })),
      clearTasks: () => set({ tasks: [], activeTaskTimeLeft: null }),
    }),
    {
      name: 'done-at-timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
