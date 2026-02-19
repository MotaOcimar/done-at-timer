import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { calculateArrivalTime } from '../utils/time';

const ArrivalDisplay = () => {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const activeTaskTimeLeft = useTaskStore((state) => state.activeTaskTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const arrivalTime = calculateArrivalTime(tasks, activeTaskTimeLeft, now);

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
        If you start right now
      </p>
    </div>
  );
};

export default ArrivalDisplay;
