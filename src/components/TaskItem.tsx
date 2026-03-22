import { motion } from 'framer-motion';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Trash2 } from 'lucide-react';
import { useSwipeToReveal } from '../hooks/useSwipeToReveal';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  eta?: Date;
  activeSwipeId?: string | null;
  onSwipeDismissAll?: (id?: string) => void;
}

const TaskItem = ({ 
  task, 
  onDelete, 
  eta, 
  activeSwipeId, 
  onSwipeDismissAll 
}: TaskItemProps) => {
  const startTask = useTaskStore((state) => state.startTask);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const totalElapsedBeforePause = useTaskStore((state) => state.totalElapsedBeforePause);
  const updateTask = useTaskStore((state) => state.updateTask);
  const pauseTask = useTaskStore((state) => state.pauseTask);
  const resumeTask = useTaskStore((state) => state.resumeTask);
  const setActiveTaskTimeLeft = useTaskStore((state) => state.setActiveTaskTimeLeft);
  const onTimeUpAction = useTaskStore((state) => state.onTimeUp);
  const completeActiveTask = useTaskStore((state) => state.completeActiveTask);
  const isTimeUpGlobal = useTaskStore((state) => state.isTimeUp);
  
  const isActive = activeTaskId === task.id;
  const isCompleted = task.status === 'COMPLETED';
  const isTimeUp = isActive && isTimeUpGlobal;

  const {
    isRevealed,
    isSwipeActive,
    redOpacity,
    dragProps
  } = useSwipeToReveal({
    id: task.id,
    isEnabled: !isCompleted,
    activeSwipeId: activeSwipeId || null,
    onSwipeDismissAll: onSwipeDismissAll || (() => {}),
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    disabled: isCompleted || isSwipeActive
  });

  const onTimeUp = () => {
    onTimeUpAction();
  };

  const { timeLeft } = useTimer(
    isActive ? (task.duration * 60 - totalElapsedBeforePause) : 0,
    onTimeUp,
    isActive ? targetEndTime : null,
  );

  const onManualComplete = () => {
    completeActiveTask(timeLeft);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    touchAction: 'pan-y' as const
  };

  useEffect(() => {
    if (isActive) {
      setActiveTaskTimeLeft(timeLeft);
    }
  }, [isActive, timeLeft, setActiveTaskTimeLeft]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      if (targetEndTime) pauseTask();
      else resumeTask();
    } else if (!isCompleted) {
      startTask(task.id);
    }
  }, [isActive, isCompleted, pauseTask, resumeTask, startTask, targetEndTime, task.id]);

  const handleTitleSave = (newTitle: string) => {
    if (newTitle !== task.title) {
      updateTask(task.id, { title: newTitle });
    }
  };

  const handleDurationSave = (newDuration: string) => {
    const duration = parseInt(newDuration, 10);
    if (!isNaN(duration) && duration > 0 && duration !== task.duration) {
      updateTask(task.id, { duration });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && e.target === e.currentTarget) {
      onDelete(task.id);
    }
  };

  const isActuallyPaused = isActive && !targetEndTime;
  const totalDurationSecs = task.duration * 60;
  const progress = Math.max(0, Math.min(1, 1 - (timeLeft / totalDurationSecs)));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={handleKeyDown}
      tabIndex={isCompleted ? -1 : 0}
      data-testid="task-item-container"
      className="outline-none"
    >
      <div className="relative mb-3 rounded-2xl overflow-hidden">
        {/* Reveal Area (Behind) */}
        {!isCompleted && (
          <motion.div 
            style={{ opacity: redOpacity }}
            className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6"
          >
            <button
              onClick={() => onDelete(task.id)}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="text-white hover:scale-110 transition-transform p-2"
              aria-label="Delete"
              tabIndex={isRevealed ? 0 : -1}
              aria-hidden={!isRevealed}
              data-testid="delete-button"
            >
              <Trash2 size={24} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}

        {/* Swipeable Card */}
        <motion.div
          {...dragProps}
          layout={isDragging ? false : "position"}
          className="relative"
        >
          <TaskCard
            task={task}
            isActive={isActive}
            isCompleted={isCompleted}
            isDragging={isDragging}
            isTimeUp={isTimeUp}
            timeLeft={timeLeft}
            progress={progress}
            isActuallyPaused={isActuallyPaused}
            eta={eta}
            onToggle={handleToggle}
            onTitleSave={handleTitleSave}
            onDurationSave={handleDurationSave}
            onComplete={onManualComplete}
          />
        </motion.div>
      </div>
    </div>
  );
};


export { TaskItem };
