// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ShareService,
  NavigatorSystemShare,
  NavigatorClipboard,
} from './shareService';
import type { ISystemShare, IClipboard } from './shareService';

describe('ShareService', () => {
  const url = 'https://example.com/done-at-timer/#r=abc';
  let systemShare: ISystemShare;
  let clipboard: IClipboard;

  beforeEach(() => {
    systemShare = {
      canShare: vi.fn().mockReturnValue(true),
      share: vi.fn().mockResolvedValue(undefined),
    };
    clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  });

  it('uses the system share sheet when available', async () => {
    const service = new ShareService(systemShare, clipboard);

    const outcome = await service.shareUrl('Morning', url);

    expect(outcome).toBe('shared');
    expect(systemShare.share).toHaveBeenCalledWith({ title: 'Morning', url });
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });

  it('reports dismissed when the user closes the share sheet, without copying', async () => {
    const abort = new Error('canceled');
    abort.name = 'AbortError';
    systemShare.share = vi.fn().mockRejectedValue(abort);
    const service = new ShareService(systemShare, clipboard);

    const outcome = await service.shareUrl('Morning', url);

    expect(outcome).toBe('dismissed');
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });

  it('copies to the clipboard when the share sheet is unavailable', async () => {
    systemShare.canShare = vi.fn().mockReturnValue(false);
    const service = new ShareService(systemShare, clipboard);

    const outcome = await service.shareUrl('Morning', url);

    expect(outcome).toBe('copied');
    expect(clipboard.writeText).toHaveBeenCalledWith(url);
  });

  it('falls back to the clipboard when the share sheet fails', async () => {
    systemShare.share = vi.fn().mockRejectedValue(new Error('boom'));
    const service = new ShareService(systemShare, clipboard);

    const outcome = await service.shareUrl('Morning', url);

    expect(outcome).toBe('copied');
    expect(clipboard.writeText).toHaveBeenCalledWith(url);
  });

  it('reports failed when the clipboard also fails', async () => {
    systemShare.canShare = vi.fn().mockReturnValue(false);
    clipboard.writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const service = new ShareService(systemShare, clipboard);

    const outcome = await service.shareUrl('Morning', url);

    expect(outcome).toBe('failed');
  });
});

describe('NavigatorSystemShare', () => {
  it('is unavailable when navigator.share does not exist', () => {
    vi.stubGlobal('navigator', {});

    expect(new NavigatorSystemShare().canShare()).toBe(false);
  });

  it('delegates to navigator.share when it exists', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share: mockShare });
    const target = new NavigatorSystemShare();

    expect(target.canShare()).toBe(true);
    await target.share({ title: 'T', url: 'https://x' });
    expect(mockShare).toHaveBeenCalledWith({ title: 'T', url: 'https://x' });
  });
});

describe('NavigatorClipboard', () => {
  it('delegates to navigator.clipboard.writeText', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } });

    await new NavigatorClipboard().writeText('hello');

    expect(mockWriteText).toHaveBeenCalledWith('hello');
  });

  it('throws when the Clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {});

    await expect(new NavigatorClipboard().writeText('hello')).rejects.toThrow();
  });
});
