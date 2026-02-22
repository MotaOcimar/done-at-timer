import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { calculateArrivalTime } from '../utils/time';

const ArrivalDisplay = () => {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const isTimeUp = useTaskStore((state) => state.isTimeUp);
  const totalElapsedBeforePause = useTaskStore(
    (state) => state.totalElapsedBeforePause,
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const { timeLeft } = useTimer(
    activeTask ? activeTask.duration * 60 - totalElapsedBeforePause : 0,
    undefined,
    targetEndTime,
  );

  // isDrifting means the arrival time is moving forward in real-time (not progress is being made)
  // This happens when the timer is paused OR when time is up and we're waiting for confirmation.
  const isDrifting = (activeTaskId && !targetEndTime) || isTimeUp;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

  useEffect(() => {
    if (allCompleted) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24', '#f87171'],
      });
    }
  }, [allCompleted]);

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
  // IMPORTANTE: Se o tempo acabou (timeLeft <= 0), usamos 0 para o cálculo do ETA,
  // pois as próximas tarefas começarão a partir de "Agora".
  const effectiveTimeLeft = activeTaskId ? Math.max(0, timeLeft) : null;
  const arrivalTime = calculateArrivalTime(tasks, effectiveTimeLeft, now);

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
    activeElapsed = Math.max(0, (activeTotalSecs - Math.max(0, timeLeft)) / 60);
  }

  const totalCompleted = completedDuration + activeElapsed;
  const progress = totalDuration > 0 ? totalCompleted / totalDuration : 0;
  const remainingMinutes = Math.max(
    0,
    Math.ceil(totalDuration - totalCompleted),
  );
  const progressPercentage = Math.min(100, Math.round(progress * 100));

  return (
    <div className={`text-center py-8 px-6 mb-10 text-white rounded-3xl shadow-2xl transition-all duration-700 ${
      isDrifting 
        ? 'bg-amber-500 shadow-amber-200' 
        : 'bg-blue-600 shadow-blue-200'
    }`}>
      <h2 className={`text-sm font-bold uppercase tracking-[0.2em] mb-4 transition-colors duration-700 ${
        isDrifting ? 'text-amber-100' : 'text-blue-200'
      }`}>
        {isDrifting ? 'Arrival time is drifting' : 'You will be done at'}
      </h2>
      <div className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter mb-8">
        {formatTime(arrivalTime)}
      </div>

      <div className="mt-8 px-4">
        <div className={`h-1.5 w-full rounded-full overflow-hidden mb-2 transition-colors duration-700 ${
          isDrifting ? 'bg-amber-900/30' : 'bg-blue-900/30'
        }`}>
          <div
            className={`h-full bg-white/90 rounded-full transition-all duration-1000 ease-linear ${activeTaskId && !isDrifting ? 'animate-pulse' : ''}`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
          ></div>
        </div>
        <div className={`flex justify-end text-xs font-bold uppercase tracking-widest opacity-80 transition-colors duration-700 ${
          isDrifting ? 'text-amber-50' : 'text-blue-100'
        }`}>
          <span>{remainingMinutes} min left</span>
        </div>
      </div>
    </div>
  );
};

export { ArrivalDisplay };
