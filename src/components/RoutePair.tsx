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
   * below, dashed segment between the glyphs) — the task cards' layout.
   * Default is the inline horizontal form.
   */
  vertical?: boolean;
  className?: string;
}

/**
 * A journey rendered in the app's maps vocabulary: circle-dot origin, dashed
 * route, map-pin arrival — `◉ 14:10 ┄┄ ⌖ 14:25`. Colors and type come from
 * the host via className/currentColor so the pair blends into any card state.
 */
// Sized against the host text, slightly under the digits' visual height, so
// the glyphs never read bigger than the numbers they accompany; nudged up to
// the digits' optical center, because flex centering works on the full line
// box — descender space included — which parks an icon visibly below digits
// that only exist above the baseline (user feedback at TK-034 review).
const GLYPH_CLASSES =
  'opacity-70 shrink-0 w-[0.75em] h-[0.75em] -translate-y-[0.07em]';

const RoutePair = ({
  start,
  end,
  completed = false,
  vertical = false,
  className = '',
}: RoutePairProps) => {
  const EndPin = completed ? MapPinCheckInside : MapPin;

  const origin = start != null && (
    <span className="inline-flex items-center gap-1">
      <CircleDot aria-hidden strokeWidth={2.5} className={GLYPH_CLASSES} />
      {/* normal-case so the word "now" stays lowercase (calm, not NOW)
          even inside the app's uppercase label rows */}
      <span data-testid="route-start" className="normal-case">
        {start === 'now' ? 'now' : timeFormatter.format(start)}
      </span>
    </span>
  );

  const arrival = (
    <span className="inline-flex items-center gap-1">
      <EndPin aria-hidden strokeWidth={2.5} className={GLYPH_CLASSES} />
      <span data-testid="route-end">{timeFormatter.format(end)}</span>
    </span>
  );

  return (
    <span
      data-testid="route-pair"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={`inline-flex tabular-nums whitespace-nowrap ${
        vertical ? 'flex-col items-start' : 'items-center gap-1'
      } ${className}`}
    >
      {origin}
      {start != null && (
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
