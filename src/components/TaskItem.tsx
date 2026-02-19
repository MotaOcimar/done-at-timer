import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onDelete }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <p className="text-sm text-gray-500">{task.duration} min</p>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 p-2"
        aria-label="Delete task"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;
