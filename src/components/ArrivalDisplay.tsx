import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { calculateArrivalTime } from '../utils/time';

const ArrivalDisplay = () => {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const totalElapsedBeforePause = useTaskStore(
    (state) => state.totalElapsedBeforePause,
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const { timeLeft } = useTimer(
    activeTask ? activeTask.duration * 60 - totalElapsedBeforePause : 0,
    undefined,
    targetEndTime,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

  if (allCompleted) {
    return (
      <div className="text-center py-12 px-6 mb-10 bg-green-500 text-white rounded-3xl shadow-2xl shadow-green-200 animate-in zoom-in duration-500">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-100"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-green-100 text-sm font-bold uppercase tracking-[0.2em] mb-2">
          Routine Complete!
        </h2>
        <div className="text-5xl font-black tracking-tight">Well Done.</div>
        <p className="text-green-100 text-lg mt-4 font-medium opacity-80">
          All tasks finished successfully.
        </p>
      </div>
    );
  }

  // Se houver tarefa ativa (mesmo pausada), o timeLeft do hook é o que conta.
  // Caso contrário, passamos null para que a função some as durações completas.
  const arrivalTime = calculateArrivalTime(tasks, activeTaskId ? timeLeft : null, now);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const totalDuration = tasks.reduce((acc, t) => acc + t.duration, 0);
  const completedDuration = tasks
    .filter((t) => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.duration, 0);

  let activeElapsed = 0;
  if (activeTask) {
    const activeTotalSecs = activeTask.duration * 60;
    activeElapsed = Math.max(0, (activeTotalSecs - timeLeft) / 60);
  }

  const totalCompleted = completedDuration + activeElapsed;
  const progress = totalDuration > 0 ? totalCompleted / totalDuration : 0;
  const remainingMinutes = Math.max(
    0,
    Math.ceil(totalDuration - totalCompleted),
  );
  const progressPercentage = Math.min(100, Math.round(progress * 100));

  return (
    <div className="text-center py-8 px-6 mb-10 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-200 transition-colors duration-500">
      <h2 className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
        You will be done at
      </h2>
      <div className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter mb-8">
        {formatTime(arrivalTime)}
      </div>

      <div className="bg-blue-800/30 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex justify-between items-end mb-2 text-blue-100 text-xs font-bold uppercase tracking-widest opacity-90">
          <span>Overall Progress</span>
          <span>{remainingMinutes} min remaining</span>
        </div>
        <div className="h-2 w-full bg-blue-900/40 rounded-full overflow-hidden">
          <div
            className={`h-full bg-white/90 rounded-full transition-all duration-1000 ease-linear ${activeTaskId ? 'animate-pulse' : ''}`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ArrivalDisplay;
