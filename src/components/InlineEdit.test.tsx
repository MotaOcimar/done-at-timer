// @vitest-environment happy-dom
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';

describe('InlineEdit', () => {
  it('stops propagation on onPointerDown when in display mode', () => {
    const containerOnPointerDown = vi.fn();
    render(
      <div onPointerDown={containerOnPointerDown}>
        <InlineEdit value="Test" onSave={vi.fn()} ariaLabel="test" />
      </div>
    );

    const displayElement = screen.getByText('Test');
    const event = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    displayElement.dispatchEvent(event);

    expect(containerOnPointerDown).not.toHaveBeenCalled();
  });

  it('stops propagation on onPointerDown when in edit mode', () => {
    const containerOnPointerDown = vi.fn();
    render(
      <div onPointerDown={containerOnPointerDown}>
        <InlineEdit value="Test" onSave={vi.fn()} ariaLabel="test" />
      </div>
    );

    // Enter edit mode
    const display = screen.getByText('Test');
    act(() => {
      display.click();
    });

    const input = screen.getByLabelText('test');
    const event = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);

    expect(containerOnPointerDown).not.toHaveBeenCalled();
  });

  it('stops propagation on onTouchStart when in display mode', () => {
    const containerOnTouchStart = vi.fn();
    render(
      <div onTouchStart={containerOnTouchStart}>
        <InlineEdit value="Test" onSave={vi.fn()} ariaLabel="test" />
      </div>
    );

    const displayElement = screen.getByText('Test');
    const event = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
    });
    displayElement.dispatchEvent(event);

    expect(containerOnTouchStart).not.toHaveBeenCalled();
  });

  it('stops propagation on onTouchStart when in edit mode', () => {
    const containerOnTouchStart = vi.fn();
    render(
      <div onTouchStart={containerOnTouchStart}>
        <InlineEdit value="Test" onSave={vi.fn()} ariaLabel="test" />
      </div>
    );

    // Enter edit mode
    const display = screen.getByText('Test');
    act(() => {
      display.click();
    });

    const input = screen.getByLabelText('test');
    const event = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);

    expect(containerOnTouchStart).not.toHaveBeenCalled();
  });
});
