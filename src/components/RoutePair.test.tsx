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
  });

  it('renders a live origin as the word "now", never a numeric time', () => {
    render(<RoutePair start="now" end={end} />);

    expect(screen.getByTestId('route-start')).toHaveTextContent(/^now$/);
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
  });

  it('omits the origin entirely when there is no start (legacy done tasks)', () => {
    const { container } = render(<RoutePair end={end} />);

    expect(screen.queryByTestId('route-start')).toBeNull();
    expect(screen.queryByTestId('route-connector')).toBeNull();
    expect(container.querySelector('.lucide-circle-dot')).toBeNull();
    expect(screen.getByTestId('route-end')).toHaveTextContent('14:25');
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
