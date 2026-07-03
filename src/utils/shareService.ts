export type ShareOutcome = 'shared' | 'copied' | 'dismissed' | 'failed';

export interface ISystemShare {
  canShare(): boolean;
  share(data: { title: string; url: string }): Promise<void>;
}

export interface IClipboard {
  writeText(text: string): Promise<void>;
}

export class NavigatorSystemShare implements ISystemShare {
  canShare(): boolean {
    return (
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    );
  }

  async share(data: { title: string; url: string }): Promise<void> {
    await navigator.share(data);
  }
}

export class NavigatorClipboard implements IClipboard {
  async writeText(text: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
  }
}

export class ShareService {
  private systemShare: ISystemShare;
  private clipboard: IClipboard;

  constructor(
    systemShare: ISystemShare = new NavigatorSystemShare(),
    clipboard: IClipboard = new NavigatorClipboard(),
  ) {
    this.systemShare = systemShare;
    this.clipboard = clipboard;
  }

  async shareUrl(title: string, url: string): Promise<ShareOutcome> {
    if (this.systemShare.canShare()) {
      try {
        await this.systemShare.share({ title, url });
        return 'shared';
      } catch (error) {
        // AbortError = the user closed the sheet on purpose; anything else
        // (e.g. permission policy) falls through to the clipboard.
        if (error instanceof Error && error.name === 'AbortError') {
          return 'dismissed';
        }
      }
    }

    try {
      await this.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}

export const shareService = new ShareService();
