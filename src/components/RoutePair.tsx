import { CircleDot, MapPin, MapPinCheckInside } from 'lucide-react';

/** 24h HH:MM, matching task ETAs (SPEC-010) and the arrival header (SPEC-006). */
const timeFormatter = new Intl.DateTimeFormat('default', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

interface RoutePairProps {
  /**
   * The departure/start endpoint. A `Date` is a fixed moment (actual or
   * predicted); the literal `'now'` marks an origin that tracks the current
   * clock and is rendered as the word "now" — a numeric origin always means
   * a fixed moment (TK-034). Omit for records with no start on file.
   */
  start?: Date | 'now' | null;
  end: Date;
  /** Arrival already reached — uses the checked pin (matches done cards). */
  completed?: boolean;
  /** Icon size in px, to blend into the host's type scale. */
  iconSize?: number;
  className?: string;
}

/**
 * A journey rendered in the app's maps vocabulary: circle-dot origin, dashed
 * route, map-pin arrival — `◉ 14:10 ┄┄ ⌖ 14:25`. Colors and type come from
 * the host via className/currentColor so the pair blends into any card state.
 */
const RoutePair = ({
  start,
  end,
  completed = false,
  iconSize = 10,
  className = '',
}: RoutePairProps) => {
  const EndPin = completed ? MapPinCheckInside : MapPin;

  return (
    <span
      data-testid="route-pair"
      className={`inline-flex items-center gap-1 tabular-nums whitespace-nowrap ${className}`}
    >
      {start != null && (
        <>
          <CircleDot
            aria-hidden
            size={iconSize}
            strokeWidth={2.5}
            className="opacity-70 shrink-0"
          />
          {/* normal-case so the word "now" stays lowercase (calm, not NOW)
              even inside the app's uppercase label rows */}
          <span data-testid="route-start" className="normal-case">
            {start === 'now' ? 'now' : timeFormatter.format(start)}
          </span>
          <span
            aria-hidden
            data-testid="route-connector"
            className="w-3 shrink-0 border-t border-dashed border-current opacity-50"
          />
        </>
      )}
      <EndPin
        aria-hidden
        size={iconSize}
        strokeWidth={2.5}
        className="opacity-70 shrink-0"
      />
      <span data-testid="route-end">{timeFormatter.format(end)}</span>
    </span>
  );
};

export { RoutePair };
