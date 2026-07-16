import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, CircleDot, MapPin } from 'lucide-react';
import { AnalogClock } from './AnalogClock';
import { IconTooltip } from './IconTooltip';
import { useTaskStore } from '../store/useTaskStore';
import { useTimer } from '../hooks/useTimer';
import { calculateArrivalTime } from '../utils/time';
import { useClock } from '../hooks/useClock';

const ArrivalDisplay = () => {
  const now = useClock();
  const tasks = useTaskStore((state) => state.tasks);
  const targetEndTime = useTaskStore((state) => state.targetEndTime);
  const activeTaskId = useTaskStore((state) => state.activeTaskId);
  const isTimeUp = useTaskStore((state) => state.isTimeUp);
  const totalElapsedBeforePause = useTaskStore(
    (state) => state.totalElapsedBeforePause,
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const { timeLeft } = useTimer(
    activeTask ? activeTask.expectedDuration * 60 - totalElapsedBeforePause : 0,
    undefined,
    targetEndTime,
  );

  // isDrifting means the arrival time is moving forward in real-time (not progress is being made)
  // This happens when the timer is paused OR when time is up and we're waiting for confirmation.
  const isDrifting = (activeTaskId && !targetEndTime) || isTimeUp;

  const allCompleted =
    tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

  useEffect(() => {
    if (allCompleted) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24', '#f87171'],
      });
    }
  }, [allCompleted]);

  if (allCompleted) {
    return (
      <div className="text-center py-12 px-6 bg-green-500 text-white rounded-3xl shadow-2xl shadow-green-200 animate-in zoom-in duration-500">
        <div className="flex justify-center mb-4">
          <CheckCircle2 size={64} strokeWidth={2} className="text-green-100" />
        </div>
        <h2 className="text-green-100 text-sm font-bold uppercase tracking-wide mb-2">
          Routine Complete!
        </h2>
        <div className="text-5xl font-black tracking-tight">Well Done.</div>
        <p className="text-green-100 text-lg mt-4 font-medium opacity-80">
          All tasks finished successfully.
        </p>
      </div>
    );
  }

  // If there is an active task (even paused), the hook's timeLeft is what counts.
  // IMPORTANT: if time is up (timeLeft <= 0), we use 0 for the ETA calculation,
  // since the next tasks will start from "Now".
  const effectiveTimeLeft = activeTaskId ? Math.max(0, timeLeft) : null;
  const arrivalTime = calculateArrivalTime(
    tasks,
    effectiveTimeLeft,
    now,
    targetEndTime,
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // The routine's start endpoint (TK-034): fixed at the first task's actual
  // start once the session is underway; before anything starts it is the
  // advancing present, rendered as the word "now" (a numeric time always
  // means a fixed moment). startedAt survives pause/resume, so the session
  // start holds steady through them; resetting the routine clears it.
  const sessionStartTs = tasks.reduce<number | null>(
    (min, t) =>
      t.startedAt !== undefined && (min === null || t.startedAt < min)
        ? t.startedAt
        : min,
    null,
  );

  const totalDuration = tasks.reduce((acc, t) => acc + t.expectedDuration, 0);
  const completedDuration = tasks
    .filter((t) => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.expectedDuration, 0);

  let activeElapsed = 0;
  if (activeTask) {
    const activeTotalSecs = activeTask.expectedDuration * 60;
    activeElapsed = Math.max(0, (activeTotalSecs - Math.max(0, timeLeft)) / 60);
  }

  const totalCompleted = completedDuration + activeElapsed;
  const progress = totalDuration > 0 ? totalCompleted / totalDuration : 0;
  const remainingMinutes = Math.max(
    0,
    Math.ceil(totalDuration - totalCompleted),
  );
  const progressPercentage = Math.min(100, Math.round(progress * 100));

  const displayState = !activeTaskId
    ? 'idle'
    : isTimeUp
      ? 'overtime'
      : !targetEndTime
        ? 'paused'
        : 'running';

  // Single source of truth for the meaning of the arrival clock: it is the estimated
  // arrival time, and when no progress is being made that estimate is slipping. Used
  // both as the visible tooltip text and as the clock group's accessible description
  // (TK-029). Deliberately neutral wording — no "late" — to avoid alarming the user.
  const stateLabel = isDrifting
    ? 'Estimated arrival time — slipping'
    : 'Estimated arrival time';

  const containerClasses = {
    running: 'bg-blue-600 shadow-blue-200 text-white shadow-2xl',
    paused:
      'bg-gray-50 border-gray-300 shadow-gray-200 text-gray-900 border shadow-xl',
    overtime:
      'bg-amber-50 border-amber-300 shadow-amber-200 text-amber-900 border shadow-xl',
    idle: 'bg-white border-gray-200 shadow-gray-200 text-gray-900 border shadow-xl',
  };

  const labelClasses = {
    running: 'text-blue-200',
    paused: 'text-gray-500',
    // amber-500 matches the task card's overtime clock (TaskCard.tsx) so the same
    // clock reads the same color across the app (TK-027).
    overtime: 'text-amber-500',
    idle: 'text-gray-500',
  };

  const progressBgClasses = {
    running: 'bg-blue-900/30',
    paused: 'bg-gray-200',
    overtime: 'bg-amber-200/50',
    idle: 'bg-gray-200',
  };

  const progressFillClasses = {
    running: 'bg-white/90',
    paused: 'bg-gray-400',
    overtime: 'bg-amber-400',
    idle: 'bg-gray-400',
  };

  const progressRemainingClasses = {
    running: 'text-blue-100',
    paused: 'text-gray-500',
    overtime: 'text-amber-700',
    idle: 'text-gray-500',
  };

  return (
    <div
      className={`text-center py-8 px-6 rounded-3xl transition-all duration-700 ${
        containerClasses[displayState]
      }`}
    >
      {/* The clock IS the estimated arrival time, so the tooltip is anchored on the
          whole group (time + icon): tapping/hovering it reveals what the number means
          — and, when it's slipping, that it's drifting — right on the number it
          describes (TK-029). The state icon hangs to the left, out of flow (absolute),
          so it never shifts the time off-center (TK-027); it's decorative here since
          the group's description already carries the meaning. */}
      <div className="flex justify-center mb-8">
        <IconTooltip label={stateLabel}>
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 sm:mr-4 flex items-center">
            {isDrifting ? (
              <AnalogClock
                time={arrivalTime}
                secondHand
                aria-hidden
                data-testid="arrival-state-icon"
                className={`w-12 h-12 sm:w-16 sm:h-16 transition-colors duration-700 ${
                  labelClasses[displayState]
                }`}
              />
            ) : (
              <MapPin
                aria-hidden
                data-testid="arrival-state-icon"
                strokeWidth={2.5}
                className={`w-12 h-12 sm:w-16 sm:h-16 transition-colors duration-700 ${
                  labelClasses[displayState]
                }`}
              />
            )}
          </span>
          <div className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter">
            {formatTime(arrivalTime)}
          </div>
        </IconTooltip>
      </div>

      <div className="mt-8 px-4">
        <div
          className={`h-1.5 w-full rounded-full overflow-hidden mb-2 transition-colors duration-700 ${
            progressBgClasses[displayState]
          }`}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${activeTaskId && !isDrifting ? 'shimmer shimmer-blue' : ''} ${displayState === 'overtime' ? 'breathe' : ''} ${
              progressFillClasses[displayState]
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div
          className={`flex items-center justify-between text-xs font-bold uppercase tracking-wide opacity-80 transition-colors duration-700 ${
            progressRemainingClasses[displayState]
          }`}
        >
          {/* Start endpoint on the left, remaining on the right: the footer
              reads as the journey's context under the big arrival clock. */}
          {tasks.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <CircleDot
                aria-hidden
                size={12}
                strokeWidth={2.5}
                className="opacity-70 shrink-0"
              />
              <span className="sr-only">Start time: </span>
              <span
                data-testid="arrival-start"
                className="tabular-nums normal-case"
              >
                {sessionStartTs ? formatTime(new Date(sessionStartTs)) : 'now'}
              </span>
            </span>
          ) : (
            <span />
          )}
          <span>{remainingMinutes} min left</span>
        </div>
      </div>
    </div>
  );
};

export { ArrivalDisplay };
