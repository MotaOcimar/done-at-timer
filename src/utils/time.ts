import type { Task } from '../types';

export const calculateArrivalTime = (
  tasks: Task[],
  activeTimeLeftSeconds: number | null,
  currentTime: Date
): Date => {
  const pendingDurationMinutes = tasks
    .filter((task) => task.status === 'PENDING')
    .reduce((acc, task) => acc + task.duration, 0);

  // Soma segundos da tarefa ativa + minutos das pendentes convertido em segundos
  const totalRemainingSeconds =
    (activeTimeLeftSeconds || 0) + pendingDurationMinutes * 60;

  return new Date(currentTime.getTime() + totalRemainingSeconds * 1000);
};
