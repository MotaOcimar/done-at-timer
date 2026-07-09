// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalogClock } from './AnalogClock';

describe('AnalogClock', () => {
  it('points the hour and minute hands at the given time', () => {
    const { getByTestId } = render(
      <AnalogClock time={new Date(2026, 0, 1, 10, 30)} aria-label="clock" />,
    );

    // 10:30 → hour hand 10*30 + 30*0.5 = 315deg, minute hand 30*6 = 180deg
    expect(getByTestId('clock-hour-hand').getAttribute('transform')).toBe(
      'rotate(315 12 12)',
    );
    expect(getByTestId('clock-minute-hand').getAttribute('transform')).toBe(
      'rotate(180 12 12)',
    );
  });

  it('uses 12-hour positions (14:15 reads like 2:15)', () => {
    const { getByTestId } = render(
      <AnalogClock time={new Date(2026, 0, 1, 14, 15)} aria-label="clock" />,
    );

    // 2:15 → hour 2*30 + 15*0.5 = 67.5deg, minute 15*6 = 90deg
    expect(getByTestId('clock-hour-hand').getAttribute('transform')).toBe(
      'rotate(67.5 12 12)',
    );
    expect(getByTestId('clock-minute-hand').getAttribute('transform')).toBe(
      'rotate(90 12 12)',
    );
  });

  it('renders a continuously sweeping second hand, phase-aligned to real time', () => {
    const { getByTestId } = render(
      <AnalogClock
        time={new Date(2026, 0, 1, 10, 30)}
        secondHand
        aria-label="clock"
      />,
    );

    const hand = getByTestId('clock-second-hand');
    // driven by the CSS sweep animation...
    expect(hand).toHaveClass('clock-second-hand');
    // ...offset into that sweep by a negative delay = the real-time phase.
    expect(hand.style.animationDelay).toMatch(/^-.*s$/);
  });

  it('omits the second hand by default (calm, no per-second motion)', () => {
    const { queryByTestId } = render(
      <AnalogClock time={new Date(2026, 0, 1, 10, 30)} aria-label="clock" />,
    );

    expect(queryByTestId('clock-second-hand')).toBeNull();
  });

  it('exposes an accessible label on the clock', () => {
    const { getByLabelText } = render(
      <AnalogClock
        time={new Date(2026, 0, 1, 10, 30)}
        aria-label="Arrival time is drifting"
      />,
    );

    expect(getByLabelText(/drifting/i)).toBeInTheDocument();
  });
});
