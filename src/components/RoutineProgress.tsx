import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';

const RoutineProgress = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const totalElapsedBeforePause = useTaskStore((state) => state.totalElapsedBeforePause);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const { timeLeft } = useTimer(
    activeTask ? (activeTask.duration * 60 - totalElapsedBeforePause) : 0,
    undefined,
    targetEndTime,
  );

  if (tasks.length === 0) return null;

  let totalDurationMinutes = 0;
  let completedDurationMinutes = 0;

  tasks.forEach((task) => {
    totalDurationMinutes += task.duration;
    if (task.status === 'COMPLETED') {
      completedDurationMinutes += task.duration;
    }
  });

  let activeTaskProgressMinutes = 0;
  if (activeTask) {
    const activeTaskDurationSecs = activeTask.duration * 60;
    const elapsedSecs = Math.max(0, activeTaskDurationSecs - timeLeft);
    activeTaskProgressMinutes = elapsedSecs / 60;
  }
  
  const totalCompletedMinutes = completedDurationMinutes + activeTaskProgressMinutes;
  const progress = Math.min(1, Math.max(0, totalCompletedMinutes / totalDurationMinutes));
  const percentage = Math.round(progress * 100);

  return (
    <div className="mb-8 px-1">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Routine Progress
        </h3>
        <span className="text-xs font-bold text-gray-500 tabular-nums">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
           className="h-full bg-green-500 transition-all duration-1000 ease-linear"
           style={{ width: `${percentage}%` }}
           role="progressbar"
        ></div>
      </div>
    </div>
  );
};

export default RoutineProgress;
