import { motion } from 'framer-motion';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Trash2 } from 'lucide-react';
import { useSwipeToReveal } from '../hooks/useSwipeToReveal';
import { getCardState, cardBorderClasses } from '../utils/cardState';

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
    x,
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

  // Bidirectional dnd-kit <-> swipe conflict resolution:
  // When dnd-kit drag ends and `drag` re-enables to "x", framer-motion may fire
  // a stale onDragEnd from the PanSession created on the original pointerdown.
  // The accumulated offset includes all horizontal movement during the dnd-kit drag,
  // which would falsely trigger a swipe reveal. This ref gates the drag callbacks
  // so stale events are discarded.
  const wasDndDragRef = useRef(false);

  useLayoutEffect(() => {
    if (isDragging) {
      wasDndDragRef.current = true;
      x.set(0);
    } else if (wasDndDragRef.current) {
      x.set(0);
      const timer = setTimeout(() => { wasDndDragRef.current = false; }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDragging, x]);

  const { timeLeft } = useTimer(
    isActive ? (task.duration * 60 - totalElapsedBeforePause) : 0,
    onTimeUpAction,
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
  const cardState = getCardState(task, isActive, isTimeUp, isActuallyPaused);
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
      <motion.div
        layout={isDragging ? false : "position"}
        className={`relative mb-3 rounded-2xl overflow-hidden border ${cardBorderClasses[cardState]}`}
      >
        {/* Reveal Area (Behind) */}
        {!isCompleted && (
          <motion.div 
            style={{ opacity: redOpacity }}
            className="absolute inset-0 bg-red-400 flex items-center justify-end pr-6"
          >
            <button
              onClick={() => onDelete(task.id)}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="text-white hover:scale-110 transition-transform p-3"
              aria-label="Delete"
              tabIndex={isRevealed ? 0 : -1}
              aria-hidden={!isRevealed}
              data-testid="delete-button"
            >
              <Trash2 size={20} strokeWidth={2} />
            </button>
          </motion.div>
        )}

        {/* Swipeable Card */}
        <motion.div
          {...dragProps}
          drag={isDragging ? false : dragProps.drag}
          onDragStart={(...args) => {
            if (wasDndDragRef.current) return;
            dragProps.onDragStart(...args);
          }}
          onDrag={(...args) => {
            if (wasDndDragRef.current) return;
            dragProps.onDrag(...args);
          }}
          onDragEnd={(...args) => {
            if (wasDndDragRef.current) {
              wasDndDragRef.current = false;
              x.set(0);
              return;
            }
            dragProps.onDragEnd(...args);
          }}
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
      </motion.div>
    </div>
  );
};


export { TaskItem };
