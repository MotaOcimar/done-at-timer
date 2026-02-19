import { useTaskStore } from '../store/useTaskStore';
import TaskItem from './TaskItem';

const TaskList = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onDelete={removeTask} />
      ))}
    </div>
  );
};

export default TaskList;
