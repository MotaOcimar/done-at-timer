import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect } from 'react';
import ProgressBar from './ProgressBar';

const ActiveTask = () => {
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const totalElapsedBeforePause = useTaskStore((state) => state.totalElapsedBeforePause);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const pauseTask = useTaskStore((state) => state.pauseTask);
  const resumeTask = useTaskStore((state) => state.resumeTask);
  const resetTasks = useTaskStore((state) => state.resetTasks);
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

  const { timeLeft } = useTimer(
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

  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

  if (allCompleted) {
    return (
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <button
          onClick={() => resetTasks()}
          className="w-full bg-white border-2 border-green-500 text-green-600 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg shadow-green-50 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Restart Routine
        </button>
      </div>
    );
  }

  if (!activeTask) return null;

  const isActuallyPaused = !targetEndTime;
  
  // Calculate progress (0 to 1)
  // Total duration in seconds vs timeLeft
  const totalDurationSecs = activeTask.duration * 60;
  const progress = Math.max(0, Math.min(1, 1 - (timeLeft / totalDurationSecs)));
  
  // Discrete time format: "5 min left" or "< 1 min left"
  const minsLeft = Math.ceil(timeLeft / 60);
  const timeDisplay = minsLeft > 0 ? `${minsLeft} min left` : '< 1 min left';

  return (
    <div className="bg-white border-2 border-gray-100 p-5 rounded-2xl mb-10 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            Working On
          </h3>
          <h2 className="text-xl font-bold text-gray-800 leading-tight">
            {activeTask.title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title={isActuallyPaused ? 'Resume' : 'Pause'}
          >
            {isActuallyPaused ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v5.832a1 1 0 001.555.832l3-2.916a1 1 0 000-1.664l-3-2.916z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={onComplete}
            className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-bold hover:bg-green-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
      
      <ProgressBar progress={progress} />
      
      <div className="flex justify-end mt-1">
        <span className="text-sm font-medium text-gray-400 tabular-nums">
          {timeDisplay}
        </span>
      </div>
    </div>
  );
};

export default ActiveTask;
