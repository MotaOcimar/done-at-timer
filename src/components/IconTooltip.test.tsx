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
});
