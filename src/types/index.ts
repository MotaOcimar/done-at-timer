export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  expectedDuration: number; // in minutes
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
    expectedDuration: number;
  }[];
  // A time of day ("HH:MM", 24h) the routine usually departs at — "my usual
  // 07:00", no date attached. Powers the saved example forecast (TK-035).
  departureTime?: string;
}
