// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoutePair } from './RoutePair';

describe('RoutePair', () => {
  const start = new Date('2026-01-01T14:10:00');
  const end = new Date('2026-01-01T14:25:00');

  it('renders both endpoints as HH:MM joined by the route glyphs', () => {
    const { container } = render(<RoutePair start={start} end={end} />);

    expect(screen.getByTestId('route-start')).toHaveTextContent('14:10');
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
    // Route vocabulary: circle-dot origin, dashed connector, map-pin arrival.
    expect(container.querySelector('.lucide-circle-dot')).not.toBeNull();
    expect(screen.getByTestId('route-connector')).toBeInTheDocument();
    expect(container.querySelector('.lucide-map-pin')).not.toBeNull();
    // Glyphs are sized relative to the text and slightly under the digit
    // height, so they never read bigger than the numbers (user feedback).
    // The glyphs stay at the line-box center; numeric times shift down to
    // meet them instead (digits sit high in the line box, the word "now"
    // does not — so the times move, never the icons; user feedback).
    for (const selector of ['.lucide-circle-dot', '.lucide-map-pin']) {
      expect(container.querySelector(selector)).toHaveClass('w-[0.75em]');
      expect(container.querySelector(selector)).not.toHaveClass(
        '-translate-y-[0.03em]',
      );
    }
    expect(screen.getByTestId('route-start')).toHaveClass(
      'translate-y-[0.03em]',
    );
    expect(screen.getByTestId('route-end')).toHaveClass(
      'translate-y-[0.03em]',
    );
  });

  it('renders a live origin as the word "now", never a numeric time', () => {
    render(<RoutePair start="now" end={end} />);

    expect(screen.getByTestId('route-start')).toHaveTextContent(/^now$/);
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
    // Lowercase "now" already sits at the glyph's optical height — only
    // numeric times take the downward nudge.
    expect(screen.getByTestId('route-start')).not.toHaveClass(
      'translate-y-[0.03em]',
    );
  });

  it('omits the origin entirely when there is no start (legacy done tasks)', () => {
    const { container } = render(<RoutePair end={end} />);

    expect(screen.queryByTestId('route-start')).toBeNull();
    expect(screen.queryByTestId('route-connector')).toBeNull();
    expect(container.querySelector('.lucide-circle-dot')).toBeNull();
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
  });

  it('stacks the endpoints vertically when asked (task cards)', () => {
    render(<RoutePair start={start} end={end} vertical />);

    const pair = screen.getByTestId('route-pair');
    expect(pair).toHaveAttribute('data-orientation', 'vertical');
    expect(pair).toHaveClass('flex-col');
    // The connector becomes a vertical dashed segment under the origin glyph.
    expect(screen.getByTestId('route-connector')).toHaveClass('border-l');
    expect(screen.getByTestId('route-start')).toHaveTextContent('14:10');
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
  });

  it('omits origin and connector in vertical mode too when there is no start', () => {
    render(<RoutePair end={end} vertical />);

    expect(screen.queryByTestId('route-start')).toBeNull();
    expect(screen.queryByTestId('route-connector')).toBeNull();
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
  });

  it('spreads the endpoints to opposite edges with no connector when spread', () => {
    render(<RoutePair start={start} end={end} spread />);

    const pair = screen.getByTestId('route-pair');
    // Horizontal, full width, origin pushed left and arrival right — the
    // active card footer mirroring the arrival header (no joining path).
    expect(pair).toHaveAttribute('data-orientation', 'horizontal');
    expect(pair).toHaveClass('w-full');
    expect(pair).toHaveClass('justify-between');
    expect(screen.queryByTestId('route-connector')).toBeNull();
    expect(screen.getByTestId('route-start')).toHaveTextContent('14:10');
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
  });

  it('pulses only the arrival endpoint when pulseArrival is set, leaving the fixed origin still', () => {
    render(<RoutePair start={start} end={end} spread pulseArrival />);

    // Overtime signals liveness on the arrival, which advances with the clock;
    // the start is a fixed past moment and must not draw attention (user
    // feedback). The pulse rides the arrival endpoint, never the container or
    // the origin.
    expect(screen.getByTestId('route-pair')).not.toHaveClass('animate-pulse');
    expect(screen.getByTestId('route-end').parentElement).toHaveClass(
      'animate-pulse',
    );
    expect(screen.getByTestId('route-start').parentElement).not.toHaveClass(
      'animate-pulse',
    );
  });

  it('leaves both endpoints still when pulseArrival is not set', () => {
    render(<RoutePair start={start} end={end} />);

    expect(screen.getByTestId('route-end').parentElement).not.toHaveClass(
      'animate-pulse',
    );
    expect(screen.getByTestId('route-start').parentElement).not.toHaveClass(
      'animate-pulse',
    );
  });

  it('uses the checked pin for completed arrivals', () => {
    const { container } = render(
      <RoutePair start={start} end={end} completed />,
    );

    expect(
      container.querySelector('.lucide-map-pin-check-inside'),
    ).not.toBeNull();
  });
});
