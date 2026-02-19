import { useTaskStore } from '../store/useTaskStore';

const RoutineControls = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const resetTasks = useTaskStore((state) => state.resetTasks);

  const hasInProgress = tasks.some((t) => t.status === 'IN_PROGRESS');
  const nextTask = tasks.find((t) => t.status === 'PENDING');
  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

  const startRoutine = () => {
    if (nextTask) {
      updateTask(nextTask.id, { status: 'IN_PROGRESS' });
    }
  };

  const handleRestart = () => {
    resetTasks();
  };

  if (hasInProgress) return null;

  if (allCompleted) {
    return (
      <div className="mb-6">
        <button
          onClick={handleRestart}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-400 transition-colors shadow-lg shadow-blue-100"
        >
          Reset Progress
        </button>
      </div>
    );
  }

  if (!nextTask) return null;

  return (
    <div className="mb-6">
      <button
        onClick={startRoutine}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-100"
      >
        Start Routine
      </button>
    </div>
  );
};

export default RoutineControls;
