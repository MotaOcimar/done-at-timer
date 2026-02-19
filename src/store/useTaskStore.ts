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
  resetTasks: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
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
        })),
      updateTask: (id, updates) =>
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          );
          
          let activeTaskId = state.activeTaskId;
          let targetEndTime = state.targetEndTime;
          let totalElapsedBeforePause = state.totalElapsedBeforePause;

          // Se a tarefa foi movida para IN_PROGRESS
          if (updates.status === 'IN_PROGRESS') {
            activeTaskId = id;
            const task = newTasks.find(t => t.id === id);
            if (task) {
              targetEndTime = Date.now() + (task.duration * 60 * 1000);
              totalElapsedBeforePause = 0;
            }
          } 
          // Se a tarefa ativa foi movida para outro estado (ex: COMPLETED)
          else if (id === state.activeTaskId && updates.status && updates.status !== 'IN_PROGRESS') {
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
