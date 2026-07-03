const SHARE_FRAGMENT_PREFIX = '#r=';

export const extractSharePayload = (hash: string): string | null => {
  if (!hash.startsWith(SHARE_FRAGMENT_PREFIX)) return null;
  const payload = hash.slice(SHARE_FRAGMENT_PREFIX.length);
  return payload === '' ? null : payload;
};

export interface IUrlFragment {
  readSharePayload(): string | null;
  clearFragment(): void;
}

export class BrowserUrlFragment implements IUrlFragment {
  readSharePayload(): string | null {
    if (typeof location === 'undefined') return null;
    return extractSharePayload(location.hash);
  }

  clearFragment(): void {
    if (typeof location === 'undefined' || typeof history === 'undefined')
      return;
    history.replaceState(null, '', location.pathname + location.search);
  }
}

export const urlFragment = new BrowserUrlFragment();
