import { Task } from '../types';

export const calculateArrivalTime = (tasks: Task[], currentTime: Date): Date => {
  const totalDuration = tasks
    .filter((task) => task.status !== 'COMPLETED')
    .reduce((acc, task) => acc + task.duration, 0);

  return new Date(currentTime.getTime() + totalDuration * 60 * 1000);
};
