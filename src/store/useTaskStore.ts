import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (title: string, duration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (title, duration) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: nanoid(),
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
}));
