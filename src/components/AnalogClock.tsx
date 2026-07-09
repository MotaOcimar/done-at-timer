import { useLayoutEffect, useRef } from 'react';

interface AnalogClockProps {
  /** The time the clock face depicts — its hour and minute hands point here. */
  time: Date;
  /** When true, render a second hand that sweeps continuously, phase-aligned to
   *  real time. Omitted → no second hand (calm, no per-second motion). */
  secondHand?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * A small analog clock whose hour and minute hands point to `time`. Used for the
 * arrival "drifting" state (TK-027): the face shows the actual arrival time (ETA),
 * so as the ETA slides forward the minute hand follows — the motion is the drift.
 *
 * The optional second hand sweeps continuously (a smooth, realistic movement) rather
 * than ticking. It is phase-aligned to the real clock with a negative CSS
 * animation-delay captured once on mount, so it reads the correct real-time position
 * without any per-frame work. Task cards omit it to keep a list of clocks calm
 * (TK-028).
 *
 * lucide's Clock has fixed hands, so this is a custom SVG. Strokes use currentColor
 * so it inherits the state color like the other icons.
 */
const AnalogClock = ({
  time,
  secondHand,
  className,
  'aria-label': ariaLabel,
}: AnalogClockProps) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();

  const hourAngle = hours * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  // Phase-align the continuous 60s sweep to the real clock via a negative
  // animation-delay, so it reads the correct real-time position. Reading the current
  // time is impure, so it happens in an effect (before paint → no flicker), set once.
  const secondHandRef = useRef<SVGLineElement>(null);
  useLayoutEffect(() => {
    if (secondHandRef.current) {
      secondHandRef.current.style.animationDelay = `-${(Date.now() / 1000) % 60}s`;
    }
  }, [secondHand]);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden={false}
      aria-label={ariaLabel}
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <line
        data-testid="clock-hour-hand"
        x1="12"
        y1="12"
        x2="12"
        y2="7.5"
        transform={`rotate(${hourAngle} 12 12)`}
      />
      <line
        data-testid="clock-minute-hand"
        x1="12"
        y1="12"
        x2="12"
        y2="5.5"
        transform={`rotate(${minuteAngle} 12 12)`}
      />
      {secondHand && (
        <line
          ref={secondHandRef}
          data-testid="clock-second-hand"
          className="clock-second-hand"
          x1="12"
          y1="12"
          x2="12"
          y2="4.5"
          strokeWidth={1}
        />
      )}
    </svg>
  );
};

export { AnalogClock };
