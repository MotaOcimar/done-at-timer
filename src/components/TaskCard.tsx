import type { Task } from '../types';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  GripHorizontal, 
  Trash2, 
  MapPin,
  MapPinCheckInside
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  isCompleted: boolean;
  isDragging?: boolean;
  isTimeUp?: boolean;
  timeLeft?: number;
  progress?: number;
  isActuallyPaused?: boolean;
  eta?: Date;
  // Drag-and-drop props (optional for overlay)
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  // Callbacks
  onDelete: (id: string) => void;
  onToggle: (e: React.MouseEvent) => void;
  onTitleSave: (newTitle: string) => void;
  onDurationSave: (newDuration: string) => void;
  onComplete: () => void;
}

type CardState = 'completed' | 'idle' | 'overtime' | 'paused' | 'running';

const StatusIcon = ({ 
  isCompleted, 
  isActive, 
  isPaused, 
  isTimeUp,
  cardState,
  onToggle 
}: { 
  isCompleted: boolean, 
  isActive: boolean, 
  isPaused: boolean, 
  isTimeUp?: boolean,
  cardState: CardState,
  onToggle: (e: React.MouseEvent) => void 
}) => {
  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full transition-colors";
  
  const iconButtonClasses: Partial<Record<CardState, string>> = {
    idle: 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500',
    paused: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    running: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
  };

  if (isCompleted) {
    return (
      <div className={`${baseClasses} text-green-500`} data-testid="checkmark-icon">
        <CheckCircle2 size={24} strokeWidth={2} />
      </div>
    );
  }

  if (isActive) {
    if (isTimeUp) {
      return (
        <div className={`${baseClasses} bg-amber-100 text-amber-500`}>
          <Clock size={24} strokeWidth={2} />
        </div>
      );
    }
    const activeClass = iconButtonClasses[cardState];
    return (
      <div className={baseClasses}>
        <button
          onClick={onToggle}
          className={`flex items-center justify-center w-full h-full rounded-full transition-colors ${activeClass || ''}`}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? (
            <Play size={24} strokeWidth={2} className="ml-0.5 fill-current" />
          ) : (
            <Pause size={24} strokeWidth={2} className="fill-current" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-full h-full rounded-full group transition-colors ${iconButtonClasses.idle}`}
        aria-label="Play task"
      >
        <Play size={24} strokeWidth={2} className="ml-0.5 fill-current" />
      </button>
    </div>
  );
};

const timeFormatter = new Intl.DateTimeFormat('default', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
});

const TaskCard = ({ 
  task, 
  isActive, 
  isCompleted, 
  isDragging, 
  isTimeUp,
  timeLeft = 0, 
  progress = 0, 
  isActuallyPaused = false,
  eta,
  setNodeRef,
  style,
  attributes,
  listeners,
  onDelete,
  onToggle,
  onTitleSave,
  onDurationSave,
  onComplete
}: TaskCardProps) => {
  const isOvertime = timeLeft < 0;
  const absSeconds = Math.abs(timeLeft);
  const mins = Math.ceil(absSeconds / 60);
  
  const timeDisplay = isOvertime 
    ? `${mins} min over`
    : mins > 0 ? `${mins} min left` : '< 1 min left';

  const cardState: CardState = isCompleted ? 'completed' :
                    !isActive ? 'idle' :
                    isTimeUp ? 'overtime' :
                    isActuallyPaused ? 'paused' : 'running';

  const cardClasses: Record<CardState, string> = {
    completed: 'border-green-100 bg-green-50/50',
    idle: 'border-gray-100 bg-white',
    overtime: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200/50',
    paused: 'border-gray-300 bg-gray-50 ring-1 ring-gray-200/50',
    running: 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/20'
  };

  const titleClasses: Record<CardState, string> = {
    completed: 'line-through text-green-800/40 font-medium',
    idle: 'text-gray-800',
    overtime: 'text-amber-600',
    paused: 'text-gray-600',
    running: 'text-blue-700 text-lg'
  };

  const labelClasses: Record<CardState, string> = {
    completed: 'text-green-700/30',
    idle: 'text-gray-400',
    overtime: 'text-amber-400',
    paused: 'text-gray-400',
    running: 'text-blue-400'
  };

  const timeDisplayClasses: Record<CardState, string> = {
    completed: 'text-green-700/30',
    idle: 'text-gray-400',
    overtime: 'text-amber-500 animate-pulse',
    paused: 'text-gray-500',
    running: 'text-blue-600'
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex flex-col p-4 mb-3 rounded-2xl shadow-sm border transition-all duration-300 ${
        cardClasses[cardState]
      } ${isDragging ? 'opacity-50 transition-none select-none' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle - Only for PENDING tasks */}
        {!isActive && !isCompleted ? (
          <div 
            {...attributes} 
            {...listeners}
            style={{ touchAction: 'none' }}
            className={`flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-300 hover:text-gray-500 transition-colors ${isDragging ? 'cursor-grabbing' : ''}`}
            aria-label="Drag to reorder"
          >
            <GripHorizontal size={20} strokeWidth={2} />
          </div>
        ) : (
          <div className="w-5 flex-shrink-0" />
        )}

        {/* Consistent Status Icon Area */}
        <div className="flex-shrink-0">
          <StatusIcon 
            isCompleted={isCompleted} 
            isActive={isActive} 
            isPaused={isActuallyPaused} 
            isTimeUp={isTimeUp}
            cardState={cardState}
            onToggle={onToggle}
          />
        </div>

        {/* Task Info Area */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold transition-all truncate ${titleClasses[cardState]}`}>
            <InlineEdit
              value={task.title}
              onSave={onTitleSave}
              ariaLabel="Task title"
            />
          </h3>
          <div className={`text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${labelClasses[cardState]}`}>
            <div>
              <InlineEdit
                value={task.duration}
                onSave={onDurationSave}
                type="number"
                ariaLabel="Task duration"
                className="mr-0"
              /> min {isActive ? `total · ${timeDisplay}` : ''}
              {isCompleted && task.actualDuration !== undefined && (
                <span className="ml-2 text-green-700/50 lowercase font-medium">
                  (took {task.actualDuration} min)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Area & ETA */}
        <div className="flex flex-col items-end justify-center min-w-[3rem]">
          <div className="flex items-center gap-1">
            {isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wide transition-all shadow-lg ${
                  isTimeUp 
                    ? 'bg-amber-400 hover:bg-amber-500 shadow-amber-100' 
                    : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                }`}
                aria-label="Done"
              >
                Done
              </button>
            )}
            {!isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            )}
          </div>
          {!isActive && eta && (
            <span className={`text-xs font-bold tabular-nums flex items-center gap-1 pr-1 whitespace-nowrap ${isCompleted ? 'text-green-700/60' : labelClasses[cardState]}`}>
              {isCompleted ? (
                <MapPinCheckInside size={10} strokeWidth={2.5} className="opacity-60" />
              ) : (
                <MapPin size={10} strokeWidth={2.5} className="opacity-70" />
              )}
              {timeFormatter.format(eta)}
            </span>
          )}
        </div>
      </div>

      {isActive && (
        <div className={`mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-500 ${
          isActuallyPaused ? 'border-gray-200' : 'border-blue-100/50'
        }`}>
          <ProgressBar 
            progress={progress} 
            isActive={!isActuallyPaused && !isTimeUp} 
            state={isTimeUp ? 'overtime' : isActuallyPaused ? 'paused' : 'running'}
          />
          {eta && (
            <div className="flex justify-end mt-2">
              <span className={`text-sm font-bold tabular-nums tracking-tight flex items-center gap-1.5 whitespace-nowrap ${
                timeDisplayClasses[cardState]
              }`}>
                <MapPin size={14} strokeWidth={2.5} className="opacity-70" />
                {timeFormatter.format(eta)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TaskCard };
