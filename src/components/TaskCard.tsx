import type { Task } from '../types';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  isCompleted: boolean;
  isDragging?: boolean;
  timeLeft?: number;
  progress?: number;
  isActuallyPaused?: boolean;
  // Drag-and-drop props (optional for overlay)
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
  // Callbacks
  onDelete: (id: string) => void;
  onToggle: (e: React.MouseEvent) => void;
  onTitleSave: (newTitle: string) => void;
  onDurationSave: (newDuration: string) => void;
  onComplete: () => void;
}

const StatusIcon = ({ 
  isCompleted, 
  isActive, 
  isPaused, 
  onToggle 
}: { 
  isCompleted: boolean, 
  isActive: boolean, 
  isPaused: boolean, 
  onToggle: (e: React.MouseEvent) => void 
}) => {
  const baseClasses = "flex items-center justify-center w-10 h-10 rounded-full transition-colors";
  
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
    return (
      <div className={baseClasses}>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-full rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
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
        className="flex items-center justify-center w-full h-full rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 group transition-colors"
        aria-label="Play task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
        </svg>
      </button>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  isActive, 
  isCompleted, 
  isDragging, 
  timeLeft = 0, 
  progress = 0, 
  isActuallyPaused = false,
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
  const minsLeft = Math.ceil(timeLeft / 60);
  const timeDisplay = minsLeft > 0 ? `${minsLeft} min left` : '< 1 min left';

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex flex-col p-4 mb-3 rounded-2xl shadow-sm border ${
        isActive ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/20' : isCompleted ? 'border-green-100 bg-green-50/50' : 'border-gray-100 bg-white'
      } ${isCompleted ? 'opacity-70' : ''} ${isDragging ? 'opacity-50 transition-none select-none' : 'transition-all duration-300'}`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className={`flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-300 hover:text-gray-500 transition-colors ${isDragging ? 'cursor-grabbing' : ''}`}
          aria-label="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Consistent Status Icon Area */}
        <div className="flex-shrink-0">
          <StatusIcon 
            isCompleted={isCompleted} 
            isActive={isActive} 
            isPaused={isActuallyPaused} 
            onToggle={onToggle}
          />
        </div>

        {/* Task Info Area */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold transition-all truncate ${
            isActive ? 'text-blue-700 text-lg' : 'text-gray-800'
          } ${isCompleted ? 'line-through text-gray-400 font-medium' : ''}`}>
            <InlineEdit
              value={task.title}
              onSave={onTitleSave}
              ariaLabel="Task title"
            />
          </h3>
          <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive ? 'text-blue-400' : 'text-gray-400'
          }`}>
            <InlineEdit
              value={task.duration}
              onSave={onDurationSave}
              type="number"
              ariaLabel="Task duration"
              className="mr-0"
            /> min {isActive ? 'total' : ''}
          </p>
        </div>

        {/* Action Buttons Area */}
        <div className="flex items-center gap-1">
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
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
      </div>

      {isActive && (
        <div className="mt-4 pt-4 border-t border-blue-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
          <ProgressBar progress={progress} isActive={!isActuallyPaused} />
          <div className="flex justify-end mt-2">
            <span className="text-sm font-black text-blue-600 tabular-nums tracking-tight">
              {timeDisplay}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export { TaskCard };
