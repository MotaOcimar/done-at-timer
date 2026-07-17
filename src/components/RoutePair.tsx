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
  /**
   * Stack the endpoints as a vertical itinerary (origin above, arrival
   * below, dashed segment between the glyphs) — the to-do/done cards' layout.
   * Default is the inline horizontal form.
   */
  vertical?: boolean;
  /**
   * Horizontal, but with the endpoints pushed to opposite edges (origin
   * left, arrival right) and no connecting path between them — the active
   * task card's footer, mirroring the arrival header's start/remaining row.
   * Spans the full width; ignored when `vertical`.
   */
  spread?: boolean;
  /**
   * Pulse only the arrival endpoint (the map-pin + its time), leaving the
   * origin still. For the overtime card, where the arrival advances with the
   * clock and deserves a live signal, but the start is a fixed past moment
   * that should not draw attention.
   */
  pulseArrival?: boolean;
  className?: string;
}

/**
 * A journey rendered in the app's maps vocabulary: circle-dot origin, dashed
 * route, map-pin arrival — `◉ 14:10 ┄┄ ⌖ 14:25`. Colors and type come from
 * the host via className/currentColor so the pair blends into any card state.
 */
// Sized against the host text, slightly under the digits' visual height, so
// the glyphs never read bigger than the numbers they accompany (user
// feedback at TK-034 review).
const GLYPH_CLASSES = 'opacity-70 shrink-0 w-[0.75em] h-[0.75em]';

// Digits sit high in the line box (they exist only above the baseline, while
// flex centering counts the descender space below it), so numeric times
// shift down to the glyph's center. The word "now" — lowercase, x-height —
// already sits there and must not move: the times take the nudge, never the
// icons (user feedback at TK-034 review).
const TIME_NUDGE = 'translate-y-[0.03em]';

const RoutePair = ({
  start,
  end,
  completed = false,
  vertical = false,
  spread = false,
  pulseArrival = false,
  className = '',
}: RoutePairProps) => {
  const EndPin = completed ? MapPinCheckInside : MapPin;

  const origin = start != null && (
    <span className="inline-flex items-center gap-1">
      <CircleDot aria-hidden strokeWidth={2.5} className={GLYPH_CLASSES} />
      {/* normal-case so the word "now" stays lowercase (calm, not NOW)
          even inside the app's uppercase label rows */}
      <span
        data-testid="route-start"
        className={`normal-case ${start === 'now' ? '' : TIME_NUDGE}`}
      >
        {start === 'now' ? 'now' : timeFormatter.format(start)}
      </span>
    </span>
  );

  const arrival = (
    <span
      className={`inline-flex items-center gap-1 ${
        pulseArrival ? 'animate-pulse' : ''
      }`}
    >
      <EndPin aria-hidden strokeWidth={2.5} className={GLYPH_CLASSES} />
      <span data-testid="route-end" className={TIME_NUDGE}>
        {timeFormatter.format(end)}
      </span>
    </span>
  );

  // vertical: an itinerary stack; spread: endpoints pushed to opposite edges
  // with no joining path; default: inline, glyphs close with a dashed link.
  const layoutClasses = vertical
    ? 'inline-flex flex-col items-start'
    : spread
      ? 'flex w-full items-center justify-between'
      : 'inline-flex items-center gap-1';

  return (
    <span
      data-testid="route-pair"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={`tabular-nums whitespace-nowrap ${layoutClasses} ${className}`}
    >
      {origin}
      {start != null && !spread && (
        <span
          aria-hidden
          data-testid="route-connector"
          className={`shrink-0 border-dashed border-current opacity-50 ${
            // ml centers the vertical segment under the 0.75em origin glyph.
            vertical ? 'h-2 border-l my-0.5 ml-[0.375em]' : 'w-3 border-t'
          }`}
        />
      )}
      {arrival}
    </span>
  );
};

export { RoutePair };
