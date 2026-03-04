import type { Task } from '../types';

export const calculateArrivalTime = (
  tasks: Task[],
  activeTimeLeftSeconds: number | null,
  currentTime: Date
): Date => {
  const pendingDurationMinutes = tasks
    .filter((task) => task.status === 'PENDING')
    .reduce((acc, task) => acc + task.duration, 0);

  // Soma segundos da tarefa ativa (garantindo que não seja negativo se estiver em overtime) 
  // + minutos das pendentes convertido em segundos
  const totalRemainingSeconds =
    Math.max(0, activeTimeLeftSeconds || 0) + pendingDurationMinutes * 60;

  return new Date(currentTime.getTime() + totalRemainingSeconds * 1000);
};

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
