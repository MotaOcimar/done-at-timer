import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';

const TaskInput = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration) return;

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) return;

    addTask(title, durationNum);
    setTitle('');
    setDuration('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Task name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Duration (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default TaskInput;
