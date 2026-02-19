import { useTaskStore } from '../store/useTaskStore';
import TaskItem from './TaskItem';

const TaskList = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);
  const clearTasks = useTaskStore((state) => state.clearTasks);

  if (tasks.length === 0) {
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
          Tasks ({tasks.length})
        </h2>
        <button
          onClick={clearTasks}
          className="text-xs font-bold text-red-300 hover:text-red-500 uppercase tracking-tighter transition-colors"
        >
          Clear All
        </button>
      </div>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onDelete={removeTask} />
      ))}
    </div>
  );
};

export default TaskList;
