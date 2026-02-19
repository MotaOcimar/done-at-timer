import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { calculateArrivalTime } from '../utils/time';

const ArrivalDisplay = () => {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const totalElapsedBeforePause = useTaskStore((state) => state.totalElapsedBeforePause);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const { timeLeft } = useTimer(
    activeTask ? (activeTask.duration * 60 - totalElapsedBeforePause) : 0,
    undefined,
    targetEndTime
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="text-center py-12 px-6 mb-10 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-200">
      <h2 className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
        You will be done at
      </h2>
      <div className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter">
        {formatTime(arrivalTime)}
      </div>
      <p className="text-blue-200 text-lg mt-4 font-medium opacity-80">
        {targetEndTime ? 'ETA based on current pace' : 'If you start right now'}
      </p>
    </div>
  );
};

export default ArrivalDisplay;
