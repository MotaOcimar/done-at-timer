import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from './TaskItem';

interface TaskListProps {
  onSaveRoutine?: () => void;
  onLoadRoutine?: () => void;
}

const TaskList = ({ onSaveRoutine, onLoadRoutine }: TaskListProps) => {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);
  const clearTasks = useTaskStore((state) => state.clearTasks);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearTimeoutId, setClearTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleClearClick = () => {
    if (isConfirmingClear) {
      if (clearTimeoutId) clearTimeout(clearTimeoutId);
      clearTasks();
      setIsConfirmingClear(false);
      setClearTimeoutId(null);
    } else {
      setIsConfirmingClear(true);
      const id = setTimeout(() => {
        setIsConfirmingClear(false);
        setClearTimeoutId(null);
      }, 3000);
      setClearTimeoutId(id);
    }
  };

  if (tasks.length === 0 && !onLoadRoutine) {
    return (
      <div className="text-center py-8 text-gray-400">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          {tasks.length > 0 ? `Tasks (${tasks.length})` : 'Plan your routine'}
        </h2>
        <div className="flex gap-4 items-center">
          {onLoadRoutine && (
            <button
              onClick={onLoadRoutine}
              className="text-xs font-bold text-blue-400 hover:text-blue-600 uppercase tracking-tighter transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Load
            </button>
          )}
          {onSaveRoutine && tasks.length > 0 && (
            <button
              onClick={onSaveRoutine}
              className="text-xs font-bold text-green-400 hover:text-green-600 uppercase tracking-tighter transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
          )}
          {tasks.length > 0 && (
            <button
              onClick={handleClearClick}
              className={`text-xs font-bold uppercase tracking-tighter transition-all duration-500 ease-in-out whitespace-nowrap text-center ${
                isConfirmingClear 
                  ? 'text-red-600 w-28 scale-105' 
                  : 'text-red-300 sm:hover:text-red-500 w-20'
              }`}
            >
              {isConfirmingClear ? 'Are you sure?' : 'Clear All'}
            </button>
          )}
        </div>
      </div>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} onDelete={removeTask} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          No tasks yet. Add one above or load a routine!
        </div>
      )}
    </div>
  );
};

export default TaskList;
