import type { Task } from '../types';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';

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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (isActive) {
    if (isTimeUp) {
      return (
        <div className={`${baseClasses} bg-amber-100 text-amber-500`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
        </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {!isActive && eta && (
            <span className={`text-xs font-bold tabular-nums flex items-center gap-1 pr-1 whitespace-nowrap ${isCompleted ? 'text-green-700/60' : labelClasses[cardState]}`}>
              {isCompleted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><path d="m9 10 2 2 4-4"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
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
