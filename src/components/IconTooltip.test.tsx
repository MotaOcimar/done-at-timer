// @vitest-environment happy-dom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IconTooltip } from './IconTooltip';

describe('IconTooltip', () => {
  it('renders its child (the icon)', () => {
    render(
      <IconTooltip label="Arrival time is locked">
        <svg data-testid="the-icon" aria-label="Arrival time is locked" />
      </IconTooltip>,
    );

    expect(screen.getByTestId('the-icon')).toBeInTheDocument();
  });

  it('hides the label until interacted with, then reveals and hides it on tap', () => {
    render(
      <IconTooltip label="Arrival time is locked">
        <svg aria-label="Arrival time is locked" />
      </IconTooltip>,
    );

    const bubble = screen.getByText('Arrival time is locked');
    // hidden by default (calm header)
    expect(bubble).toHaveClass('opacity-0');

    fireEvent.click(screen.getByRole('button'));
    expect(bubble).toHaveClass('opacity-100');

    fireEvent.click(screen.getByRole('button'));
    expect(bubble).toHaveClass('opacity-0');
  });

  // A centered bubble is fine in open space (the arrival header), but overflows
  // when the trigger sits against a clipped container's edge (TK-032).
  it('centers the bubble on the trigger by default', () => {
    render(
      <IconTooltip label="Arrival time is locked">
        <svg aria-label="Arrival time is locked" />
      </IconTooltip>,
    );

    const bubble = screen.getByText('Arrival time is locked');
    expect(bubble).toHaveClass('left-1/2', '-translate-x-1/2');
    expect(bubble).not.toHaveClass('right-0');
  });

  it('anchors the bubble to the trigger\'s right edge when align is "end"', () => {
    render(
      <IconTooltip label="Estimated arrival time if started now" align="end">
        <svg aria-hidden />
      </IconTooltip>,
    );

    const bubble = screen.getByText('Estimated arrival time if started now');
    expect(bubble).toHaveClass('right-0');
    expect(bubble).not.toHaveClass('left-1/2', '-translate-x-1/2');
  });

  // An explicit width, not max-width: an absolute box with width auto shrinks to
  // its longest word, stacking the label into a narrow column (TK-032).
  it('lets a long label wrap within a set width', () => {
    render(
      <IconTooltip label="Estimated arrival time if started now" align="end">
        <svg aria-hidden />
      </IconTooltip>,
    );

    const bubble = screen.getByText('Estimated arrival time if started now');
    expect(bubble).not.toHaveClass('whitespace-nowrap');
    expect(bubble.className).toMatch(/\bw-\d+\b/);
  });
});
