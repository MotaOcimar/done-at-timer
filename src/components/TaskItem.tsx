import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onDelete }: TaskItemProps) => {
  const startTask = useTaskStore((state) => state.startTask);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  
  const isActive = activeTaskId === task.id;

  return (
    <div className={`flex items-center justify-between p-3 mb-2 bg-white rounded-lg shadow-sm border ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
      <div className="flex-1">
        <h3 className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>{task.title}</h3>
        <p className="text-sm text-gray-500">{task.duration} min</p>
      </div>
      <div className="flex items-center gap-2">
        {!isActive && (
          <button
            onClick={() => startTask(task.id)}
            className="text-blue-500 hover:text-blue-700 p-2"
            aria-label="Play task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v5.832a1 1 0 001.555.832l3-2.916a1 1 0 000-1.664l-3-2.916z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {isActive && (
          <span className="text-blue-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 p-2"
          aria-label="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
