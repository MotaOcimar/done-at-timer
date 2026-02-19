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
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="What's next?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 p-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-base"
        />
        <div className="flex items-center gap-1 bg-white border-2 border-gray-100 rounded-xl px-2 focus-within:border-blue-500 transition-colors">
          <input
            type="number"
            placeholder="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-10 p-3 bg-transparent focus:outline-none text-base text-center"
          />
          <span className="text-gray-300 text-xs font-bold uppercase mr-1">
            min
          </span>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors font-bold flex-shrink-0 shadow-lg shadow-blue-100"
          aria-label="Add task"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default TaskInput;
