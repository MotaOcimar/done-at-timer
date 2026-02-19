import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect } from 'react';

const ActiveTask = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const activeTask = tasks.find((t) => t.status === 'IN_PROGRESS');

  const onComplete = () => {
    if (activeTask) {
      updateTask(activeTask.id, { status: 'COMPLETED' });

      // Automatically start the next task
      const nextTask = tasks.find(
        (t) => t.status === 'PENDING' && t.id !== activeTask.id,
      );
      if (nextTask) {
        updateTask(nextTask.id, { status: 'IN_PROGRESS' });
      }
    }
  };

  const { timeLeft, isPaused, start, pause, reset } = useTimer(
    activeTask ? activeTask.duration * 60 : 0,
    onComplete,
  );

  useEffect(() => {
    if (activeTask) {
      reset(activeTask.duration * 60);
      start();
    }
  }, [activeTask?.id, reset, start]);

  if (!activeTask) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl mb-8 text-center">
      <h3 className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">
        Working On
      </h3>
      <h2 className="text-3xl font-black mb-4">{activeTask.title}</h2>
      <div className="text-6xl font-mono font-bold mb-6 tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center gap-4">
        {isPaused ? (
          <button
            onClick={start}
            className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-400 transition-colors border-2 border-blue-400"
          >
            Pause
          </button>
        )}
        <button
          onClick={onComplete}
          className="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-green-400 transition-colors shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ActiveTask;
