// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { extractSharePayload, BrowserUrlFragment } from './urlFragment';

describe('extractSharePayload', () => {
  it('extracts the payload from a #r= fragment', () => {
    expect(extractSharePayload('#r=abc123')).toBe('abc123');
  });

  it('returns null for an empty hash', () => {
    expect(extractSharePayload('')).toBeNull();
  });

  it('returns null for an unrelated fragment', () => {
    expect(extractSharePayload('#section-2')).toBeNull();
  });

  it('returns null for a #r= fragment with no payload', () => {
    expect(extractSharePayload('#r=')).toBeNull();
  });
});

describe('BrowserUrlFragment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the share payload from window.location.hash', () => {
    vi.stubGlobal('location', { hash: '#r=xyz' });

    expect(new BrowserUrlFragment().readSharePayload()).toBe('xyz');
  });

  it('clears the fragment via history.replaceState, keeping path and query', () => {
    const mockReplaceState = vi.fn();
    vi.stubGlobal('location', {
      hash: '#r=xyz',
      pathname: '/done-at-timer/',
      search: '?a=1',
    });
    vi.stubGlobal('history', { replaceState: mockReplaceState });

    new BrowserUrlFragment().clearFragment();

    expect(mockReplaceState).toHaveBeenCalledWith(
      null,
      '',
      '/done-at-timer/?a=1',
    );
  });
});
