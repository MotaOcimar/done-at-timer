export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  status: TaskStatus;
}

export interface Routine {
  id: string;
  name: string;
  tasks: {
    title: string;
    duration: number;
  }[];
}
