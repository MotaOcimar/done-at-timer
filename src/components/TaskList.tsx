import { useState, useMemo, useCallback } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Save, 
  RotateCcw 
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';
import { calculateIntermediateETAs } from '../utils/time';
import { useClock } from '../hooks/useClock';
import { getCardState } from '../utils/cardState';

interface TaskListProps {
  onSaveRoutine?: () => void;
  children?: React.ReactNode;
}

const TaskList = ({ onSaveRoutine, children }: TaskListProps) => {
  const tasks = useTaskStore((state) => state.tasks);
  const removeTask = useTaskStore((state) => state.removeTask);
  const clearTasks = useTaskStore((state) => state.clearTasks);
  const resetTasks = useTaskStore((state) => state.resetTasks);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const activeTaskTimeLeft = useTaskStore((state) => state.activeTaskTimeLeft);
  const activeTaskIdFromStore = useTaskStore((state) => state.activeTaskId);
  const isTimeUpGlobal = useTaskStore((state) => state.isTimeUp);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearTimeoutId, setClearTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);
  const currentTime = useClock();

  // Calculate intermediate ETAs based on current time
  const etas = useMemo(() => 
    calculateIntermediateETAs(tasks, activeTaskTimeLeft, currentTime),
    [tasks, activeTaskTimeLeft, currentTime]
  );

  const handleSwipeDismissAll = useCallback((newId?: string) => {
    setActiveSwipeId(newId || null);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    // Dismiss all swipes when starting a drag
    handleSwipeDismissAll();
    
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderTasks(active.id.toString(), over.id.toString());
    }

    setActiveTask(null);
  };

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

  if (tasks.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-center py-8 text-gray-400">
          No tasks yet. Add one below!
        </div>
        {children}
      </div>
    );
  }

  const allCompleted = tasks.every((t) => t.status === 'COMPLETED');

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
          Tasks ({tasks.length})
        </h2>
        <div className="flex gap-4 items-center">
          {onSaveRoutine && (
            <button
              onClick={onSaveRoutine}
              className="text-xs font-bold text-green-400 hover:text-green-600 uppercase tracking-wide transition-colors flex items-center gap-1"
            >
              <Save size={12} strokeWidth={2} />
              Save
            </button>
          )}
          <button
            onClick={handleClearClick}
            className={`text-xs font-bold uppercase tracking-wide transition-all duration-500 ease-in-out whitespace-nowrap text-center ${
              isConfirmingClear 
                ? 'text-red-600 w-28' 
                : 'text-red-300 sm:hover:text-red-500 w-20'
            }`}
          >
            {isConfirmingClear ? 'Are you sure?' : 'Clear All'}
          </button>
        </div>
      </div>
      
      {allCompleted && (
        <div className="mb-6 animate-in fade-in zoom-in duration-500">
          <button
            onClick={() => resetTasks()}
            className="w-full bg-white border-2 border-green-500 text-green-600 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-md shadow-green-50 flex items-center justify-center gap-2"
          >
            <RotateCcw size={24} strokeWidth={2} />
            Restart Routine
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <LayoutGroup>
            {tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onDelete={removeTask} 
                eta={etas.get(task.id)}
                activeSwipeId={activeSwipeId}
                onSwipeDismissAll={handleSwipeDismissAll}
              />
            ))}
            {children && (
              <motion.div layout="position">
                {children}
              </motion.div>
            )}
          </LayoutGroup>
        </SortableContext>
        <DragOverlay adjustScale={false}>
          {activeTask ? (() => {
            const isActive = activeTask.id === activeTaskIdFromStore;
            const isTimeUp = isActive && isTimeUpGlobal;
            const timeLeft = isActive ? (activeTaskTimeLeft ?? 0) : 0;
            const progress = isActive ? (1 - (timeLeft / (activeTask.duration * 60))) : 0;
            const cardState = getCardState(activeTask, isActive, isTimeUp, false);
            
            return (
              <div className="w-full opacity-90 shadow-2xl rounded-2xl transition-none pointer-events-none bg-white">
                <TaskCard 
                  task={activeTask} 
                  isActive={isActive}
                  isCompleted={activeTask.status === 'COMPLETED'}
                  cardState={cardState}
                  isDragging={true}
                  isTimeUp={isTimeUp}
                  timeLeft={timeLeft}
                  progress={progress}
                  eta={etas.get(activeTask.id)}
                  onToggle={() => {}}
                  onTitleSave={() => {}}
                  onDurationSave={() => {}}
                  onComplete={() => {}}
                />
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export { TaskList };