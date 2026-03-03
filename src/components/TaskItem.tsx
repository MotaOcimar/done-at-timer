import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onDelete }: TaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

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

  const onTimeUp = () => {
    onTimeUpAction();
  };

  const onManualComplete = () => {
    completeActiveTask(timeLeft);
  };

  const { timeLeft } = useTimer(
    isActive ? (task.duration * 60 - totalElapsedBeforePause) : 0,
    onTimeUp,
    isActive ? targetEndTime : null,
  );

  useEffect(() => {
    if (isActive) {
      setActiveTaskTimeLeft(timeLeft);
    }
  }, [isActive, timeLeft, setActiveTaskTimeLeft]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      if (targetEndTime) pauseTask();
      else resumeTask();
    } else if (!isCompleted) {
      startTask(task.id);
    }
  };

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

  const isActuallyPaused = isActive && !targetEndTime;
  const totalDurationSecs = task.duration * 60;
  const progress = Math.max(0, Math.min(1, 1 - (timeLeft / totalDurationSecs)));

  return (
    <TaskCard
      task={task}
      isActive={isActive}
      isCompleted={isCompleted}
      isDragging={isDragging}
      isTimeUp={isTimeUp}
      timeLeft={timeLeft}
      progress={progress}
      isActuallyPaused={isActuallyPaused}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      onDelete={onDelete}
      onToggle={handleToggle}
      onTitleSave={handleTitleSave}
      onDurationSave={handleDurationSave}
      onComplete={onManualComplete}
    />
  );
};

export { TaskItem };
