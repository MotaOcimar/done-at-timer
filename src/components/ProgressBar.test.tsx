import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with the correct width based on progress', () => {
    render(<ProgressBar progress={0.3} />);
    const bar = screen.getByRole('progressbar');
    
    // Check if the inner bar has the correct style width (30%)
    expect(bar.firstChild).toHaveStyle('width: 30%');
  });

  it('handles 0% and 100% progress', () => {
    const { rerender } = render(<ProgressBar progress={0} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.firstChild).toHaveStyle('width: 0%');

    rerender(<ProgressBar progress={1} />);
    expect(bar.firstChild).toHaveStyle('width: 100%');
  });

  it('has the correct ARIA attributes', () => {
    render(<ProgressBar progress={0.45} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders pulse animation when active', () => {
    const { rerender } = render(<ProgressBar progress={0.5} isActive={true} />);
    const bar = screen.getByRole('progressbar').firstChild;
    expect(bar).toHaveClass('animate-pulse');

    rerender(<ProgressBar progress={0.5} isActive={false} />);
    const inactiveBar = screen.getByRole('progressbar').firstChild;
    expect(inactiveBar).not.toHaveClass('animate-pulse');
  });
});
