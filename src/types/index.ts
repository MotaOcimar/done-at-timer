export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  actualDuration?: number; // in minutes
  startedAt?: number; // timestamp of the current/last run's start
  completedAt?: number; // timestamp
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
