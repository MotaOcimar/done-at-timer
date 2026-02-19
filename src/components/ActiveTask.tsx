import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect } from 'react';

const ActiveTask = () => {
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const totalElapsedBeforePause = useTaskStore((state) => state.totalElapsedBeforePause);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const pauseTask = useTaskStore((state) => state.pauseTask);
  const resumeTask = useTaskStore((state) => state.resumeTask);
  const setActiveTaskTimeLeft = useTaskStore(
    (state) => state.setActiveTaskTimeLeft,
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const onComplete = () => {
    if (activeTask) {
      updateTask(activeTask.id, { status: 'COMPLETED' });
      setActiveTaskTimeLeft(null);

      const nextTask = tasks.find(
        (t) => t.status === 'PENDING' && t.id !== activeTask.id,
      );
      if (nextTask) {
        useTaskStore.getState().startTask(nextTask.id);
      }
    }
  };

  const { timeLeft, isPaused } = useTimer(
    activeTask ? (activeTask.duration * 60 - totalElapsedBeforePause) : 0,
    onComplete,
    targetEndTime,
  );

  const handlePlayPause = () => {
    if (targetEndTime) {
      pauseTask();
    } else {
      resumeTask();
    }
  };

  // Sync timeLeft with Store for Arrival Time calculation
  useEffect(() => {
    if (activeTask) {
      setActiveTaskTimeLeft(timeLeft);
    } else {
      setActiveTaskTimeLeft(null);
    }
  }, [activeTask, timeLeft, setActiveTaskTimeLeft]);

  if (!activeTask) return null;

  const isActuallyPaused = !targetEndTime;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-5 rounded-2xl mb-10 flex items-center justify-between shadow-sm">
      <div className="text-left">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
          Working On
        </h3>
        <h2 className="text-xl font-bold text-gray-800 leading-tight">
          {activeTask.title}
        </h2>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="text-3xl font-mono font-bold text-blue-600 tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors shadow-sm"
            title={isActuallyPaused ? 'Resume' : 'Pause'}
          >
            {isActuallyPaused ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v5.832a1 1 0 001.555.832l3-2.916a1 1 0 000-1.664l-3-2.916z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button
            onClick={onComplete}
            className="px-4 py-1.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-400 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveTask;
