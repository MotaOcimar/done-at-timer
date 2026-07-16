import type { Task } from '../types';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';
import { RoutePair } from './RoutePair';
import { type CardState } from '../utils/cardState';
import { AnalogClock } from './AnalogClock';
import { CheckCircle2, Play, Pause } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  isCompleted: boolean;
  cardState: CardState;
  isDragging?: boolean;
  isTimeUp?: boolean;
  timeLeft?: number;
  progress?: number;
  isActuallyPaused?: boolean;
  eta?: Date;
  /** Current tick, to tell a live "now" origin from a fixed moment (TK-034). */
  now?: Date;
  // Callbacks
  onToggle: (e: React.MouseEvent) => void;
  onTitleSave: (newTitle: string) => void;
  onDurationSave: (newDuration: string) => void;
  onComplete: () => void;
}

const StatusIcon = ({
  isCompleted,
  isActive,
  isPaused,
  isTimeUp,
  cardState,
  eta,
  onToggle,
}: {
  isCompleted: boolean;
  isActive: boolean;
  isPaused: boolean;
  isTimeUp?: boolean;
  cardState: CardState;
  eta?: Date;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  const baseClasses =
    'flex items-center justify-center w-10 h-10 rounded-full transition-colors';

  const iconButtonClasses: Partial<Record<CardState, string>> = {
    idle: 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500',
    paused: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    running: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  };

  if (isCompleted) {
    return (
      <div
        className={`${baseClasses} text-green-500`}
        data-testid="checkmark-icon"
      >
        <CheckCircle2 size={24} strokeWidth={2} />
      </div>
    );
  }

  if (isActive) {
    if (isTimeUp) {
      // The predicted completion of an overtime task is "now" (it has overrun), so
      // its analog clock reads the current time. No second hand — a list of cards
      // should stay calm (TK-028).
      return (
        <div className={`${baseClasses} bg-amber-100 text-amber-500`}>
          <AnalogClock
            time={eta ?? new Date()}
            aria-label="Task is overtime"
            className="w-6 h-6"
          />
        </div>
      );
    }
    const activeClass = iconButtonClasses[cardState];
    return (
      <div className={baseClasses}>
        <button
          onClick={onToggle}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`flex items-center justify-center w-full h-full rounded-full group transition-colors ${iconButtonClasses.idle}`}
        aria-label="Play task"
      >
        <Play size={24} strokeWidth={2} className="ml-0.5 fill-current" />
      </button>
    </div>
  );
};

const cardClasses: Record<CardState, string> = {
  completed: 'bg-green-50/50',
  idle: 'bg-white',
  overtime: 'bg-amber-50 ring-2 ring-amber-200/50',
  paused: 'bg-gray-50 ring-1 ring-gray-200/50',
  running: 'bg-blue-50 ring-1 ring-blue-500/20',
};

const titleClasses: Record<CardState, string> = {
  completed: 'line-through text-green-800/40 font-medium',
  idle: 'text-gray-800',
  overtime: 'text-amber-600',
  paused: 'text-gray-600',
  running: 'text-blue-700 text-lg',
};

const labelClasses: Record<CardState, string> = {
  completed: 'text-green-700/30',
  idle: 'text-gray-400',
  overtime: 'text-amber-400',
  paused: 'text-gray-400',
  running: 'text-blue-400',
};

const timeDisplayClasses: Record<CardState, string> = {
  completed: 'text-green-700/30',
  idle: 'text-gray-400',
  overtime: 'text-amber-500 animate-pulse',
  paused: 'text-gray-500',
  running: 'text-blue-600',
};

const TaskCard = ({
  task,
  isActive,
  isCompleted,
  cardState,
  isDragging,
  isTimeUp,
  timeLeft = 0,
  progress = 0,
  isActuallyPaused = false,
  eta,
  now,
  onToggle,
  onTitleSave,
  onDurationSave,
  onComplete,
}: TaskCardProps) => {
  const isOvertime = timeLeft < 0;
  const absSeconds = Math.abs(timeLeft);
  const mins = Math.ceil(absSeconds / 60);

  const timeDisplay = isOvertime
    ? `${mins} min over`
    : mins > 0
      ? `${mins} min left`
      : '< 1 min left';

  // The card's start endpoint (TK-034): done/running tasks show the moment
  // they actually started (omitted for records predating startedAt); a to-do
  // task shows its predicted start — its ETA minus its own estimate, the same
  // projection chain that produced the ETA (SPEC-005). A predicted start that
  // isn't in the future reads as the word "now": a numeric origin always
  // means a fixed moment, never the advancing present.
  let routeStart: Date | 'now' | undefined;
  if (isCompleted || isActive) {
    routeStart = task.startedAt ? new Date(task.startedAt) : undefined;
  } else if (eta) {
    const predictedStart = new Date(
      eta.getTime() - task.expectedDuration * 60_000,
    );
    routeStart = now && predictedStart <= now ? 'now' : predictedStart;
  }

  return (
    <div
      data-testid="task-card"
      className={`flex flex-col p-4 rounded-2xl shadow-sm transition-all duration-300 ${
        cardClasses[cardState]
      } ${isDragging ? 'opacity-50 transition-none select-none' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Consistent Status Icon Area */}
        <div className="flex-shrink-0">
          <StatusIcon
            isCompleted={isCompleted}
            isActive={isActive}
            isPaused={isActuallyPaused}
            isTimeUp={isTimeUp}
            cardState={cardState}
            eta={eta}
            onToggle={onToggle}
          />
        </div>

        {/* Task Info Area */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold transition-all truncate ${titleClasses[cardState]}`}
          >
            <InlineEdit
              value={task.title}
              onSave={onTitleSave}
              ariaLabel="Task title"
            />
          </h3>
          <div
            className={`text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${labelClasses[cardState]}`}
          >
            <div>
              <InlineEdit
                value={task.expectedDuration}
                onSave={onDurationSave}
                type="number"
                ariaLabel="Task duration"
                className="mr-0"
              />{' '}
              min {isActive ? `total · ${timeDisplay}` : ''}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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
          </div>
          {!isActive && eta && (
            <RoutePair
              start={routeStart}
              end={eta}
              completed={isCompleted}
              className={`text-xs font-bold pr-1 ${isCompleted ? 'text-green-700/60' : labelClasses[cardState]}`}
            />
          )}
        </div>
      </div>

      {isActive && (
        <div
          className={`mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-500 ${
            isActuallyPaused ? 'border-gray-200' : 'border-blue-100/50'
          }`}
        >
          <ProgressBar
            progress={progress}
            isActive={!isActuallyPaused && !isTimeUp}
            state={
              isTimeUp ? 'overtime' : isActuallyPaused ? 'paused' : 'running'
            }
          />
          {eta && (
            <div className="flex justify-end mt-2">
              <RoutePair
                start={routeStart}
                end={eta}
                iconSize={14}
                className={`text-sm font-bold tracking-tight ${
                  timeDisplayClasses[cardState]
                }`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TaskCard };
