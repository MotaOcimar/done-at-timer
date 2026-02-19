import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { calculateArrivalTime } from '../utils/time';

const ArrivalDisplay = () => {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const arrivalTime = calculateArrivalTime(tasks, now);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="text-center my-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
      <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-2">
        Done-At
      </h2>
      <div className="text-5xl font-black text-blue-900 tabular-nums">
        {formatTime(arrivalTime)}
      </div>
      <p className="text-blue-400 text-sm mt-2 font-medium">If you start now</p>
    </div>
  );
};

export default ArrivalDisplay;
