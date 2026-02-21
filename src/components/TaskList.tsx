import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  onSaveRoutine?: () => void;
  onLoadRoutine?: () => void;
}

const TaskList = ({ onSaveRoutine, onLoadRoutine }: TaskListProps) => {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);
  const clearTasks = useTaskStore((state) => state.clearTasks);
  const resetTasks = useTaskStore((state) => state.resetTasks);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearTimeoutId, setClearTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderTasks(active.id.toString(), over.id.toString());
    }
  };

  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

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
      
      {allCompleted && (
        <div className="mb-6 animate-in fade-in zoom-in duration-500">
          <button
            onClick={() => resetTasks()}
            className="w-full bg-white border-2 border-green-500 text-green-600 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg shadow-green-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart Routine
          </button>
        </div>
      )}

      {tasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onDelete={removeTask} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No tasks yet. Add one above or load a routine!
        </div>
      )}
    </div>
  );
};

export { TaskList };
