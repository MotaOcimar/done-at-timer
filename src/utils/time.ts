import type { Task } from '../types';

export const calculateIntermediateETAs = (
  tasks: Task[],
  activeTimeLeftSeconds: number | null,
  currentTime: Date
): Map<string, Date> => {
  const etas = new Map<string, Date>();
  let currentAccumulatedTime = currentTime.getTime();

  for (const task of tasks) {
    if (task.status === 'COMPLETED') {
      if (task.completedAt) {
        etas.set(task.id, new Date(task.completedAt));
      }
    } else if (task.status === 'IN_PROGRESS') {
      const timeLeft = Math.max(0, activeTimeLeftSeconds || 0); // Handle overtime (<= 0)
      currentAccumulatedTime += timeLeft * 1000;
      etas.set(task.id, new Date(currentAccumulatedTime));
    } else if (task.status === 'PENDING') {
      currentAccumulatedTime += task.duration * 60 * 1000;
      etas.set(task.id, new Date(currentAccumulatedTime));
    }
  }

  return etas;
};

export const calculateArrivalTime = (
  tasks: Task[],
  activeTimeLeftSeconds: number | null,
  currentTime: Date
): Date => {
  const etas = calculateIntermediateETAs(tasks, activeTimeLeftSeconds, currentTime);
  
  // Find the last non-completed task (Active or Pending)
  // If all tasks are completed, or no tasks, arrival time is 'now'
  let lastEta = currentTime;
  
  // Tasks are ordered, so we can just iterate and pick the last one that isn't COMPLETED
  // or specifically, the last one in the map that corresponds to a non-completed task.
  for (const task of tasks) {
    if (task.status !== 'COMPLETED') {
      const eta = etas.get(task.id);
      if (eta) {
        lastEta = eta;
      }
    }
  }

  return lastEta;
};
