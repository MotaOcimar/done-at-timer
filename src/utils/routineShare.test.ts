// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  encodeRoutinePayload,
  decodeRoutinePayload,
  buildRoutineShareUrl,
} from './routineShare';
import type { SharedRoutine } from './routineShare';

const routine: SharedRoutine = {
  name: 'Morning Focus',
  tasks: [
    { title: 'Shower', expectedDuration: 10 },
    { title: 'Breakfast', expectedDuration: 20 },
  ],
};

describe('encodeRoutinePayload', () => {
  it('produces a URL-safe string (base64url alphabet only)', () => {
    const payload = encodeRoutinePayload(routine);

    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('stays URL-safe for content that base64-encodes to + and /', () => {
    // '?>>' → 'Pz4+' and '~~~' → 'fn5+' in plain base64; base64url must use - and _
    const payload = encodeRoutinePayload({
      name: '?>>~~~',
      tasks: [{ title: '???>>>~~~', expectedDuration: 5 }],
    });

    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('buildRoutineShareUrl', () => {
  it('appends the payload as the #r fragment of the base URL', () => {
    const url = buildRoutineShareUrl(
      routine,
      'https://example.com/done-at-timer/',
    );

    expect(url).toBe(
      `https://example.com/done-at-timer/#r=${encodeRoutinePayload(routine)}`,
    );
  });
});

describe('decodeRoutinePayload', () => {
  it('round-trips a routine', () => {
    const result = decodeRoutinePayload(encodeRoutinePayload(routine));

    expect(result).toEqual({ ok: true, routine });
  });

  it('round-trips unicode titles and names', () => {
    const unicode: SharedRoutine = {
      name: 'Café da manhã ☕',
      tasks: [
        { title: 'Meditação 🧘', expectedDuration: 15 },
        { title: 'Ação & revisão', expectedDuration: 5 },
      ],
    };

    const result = decodeRoutinePayload(encodeRoutinePayload(unicode));

    expect(result).toEqual({ ok: true, routine: unicode });
  });

  it('rejects a payload that is not base64url', () => {
    const result = decodeRoutinePayload('not base64!!');

    expect(result).toEqual({ ok: false, error: 'INVALID' });
  });

  it('rejects a truncated payload', () => {
    const payload = encodeRoutinePayload(routine);

    const result = decodeRoutinePayload(payload.slice(0, payload.length - 10));

    expect(result).toEqual({ ok: false, error: 'INVALID' });
  });

  it('rejects an empty payload', () => {
    const result = decodeRoutinePayload('');

    expect(result).toEqual({ ok: false, error: 'INVALID' });
  });

  const encodeRaw = (value: unknown): string =>
    Buffer.from(JSON.stringify(value), 'utf-8').toString('base64url');

  it('rejects a payload from an unsupported future version', () => {
    const payload = encodeRaw({
      v: 2,
      name: 'Future',
      tasks: [{ title: 'T', duration: 5 }],
    });

    const result = decodeRoutinePayload(payload);

    expect(result).toEqual({ ok: false, error: 'UNSUPPORTED_VERSION' });
  });

  it.each([
    ['a non-object', 42],
    ['a missing version', { name: 'X', tasks: [{ title: 'T', duration: 5 }] }],
    ['a missing name', { v: 1, tasks: [{ title: 'T', duration: 5 }] }],
    [
      'a blank name',
      { v: 1, name: '   ', tasks: [{ title: 'T', duration: 5 }] },
    ],
    ['missing tasks', { v: 1, name: 'X' }],
    ['an empty task list', { v: 1, name: 'X', tasks: [] }],
    ['a task without a title', { v: 1, name: 'X', tasks: [{ duration: 5 }] }],
    [
      'a task with a non-string title',
      { v: 1, name: 'X', tasks: [{ title: 7, duration: 5 }] },
    ],
    [
      'a task with a string duration',
      { v: 1, name: 'X', tasks: [{ title: 'T', duration: '5' }] },
    ],
    [
      'a task with a zero duration',
      { v: 1, name: 'X', tasks: [{ title: 'T', duration: 0 }] },
    ],
    [
      'a task with a negative duration',
      { v: 1, name: 'X', tasks: [{ title: 'T', duration: -5 }] },
    ],
    [
      'a task with an infinite duration',
      { v: 1, name: 'X', tasks: [{ title: 'T', duration: Infinity }] },
    ],
  ])('rejects a hand-edited payload with %s', (_label, raw) => {
    const result = decodeRoutinePayload(encodeRaw(raw));

    expect(result).toEqual({ ok: false, error: 'INVALID' });
  });

  it('keeps only title and duration from hand-edited task objects', () => {
    const payload = encodeRaw({
      v: 1,
      name: 'X',
      tasks: [{ title: 'T', duration: 5, status: 'COMPLETED', id: 'evil' }],
    });

    const result = decodeRoutinePayload(payload);

    expect(result).toEqual({
      ok: true,
      routine: { name: 'X', tasks: [{ title: 'T', expectedDuration: 5 }] },
    });
  });
});

// The v1 wire format is frozen: tasks carry the key "duration" on the wire
// regardless of what the field is called inside the app. These tests pin the
// boundary so an internal rename can never silently break existing links.
describe('wire format (v1 links stay valid)', () => {
  const decodeRaw = (payload: string): unknown =>
    JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

  it('writes the v1 key "duration" on the wire', () => {
    const payload = encodeRoutinePayload(routine);

    const raw = decodeRaw(payload) as {
      tasks: Record<string, unknown>[];
    };
    for (const task of raw.tasks) {
      expect(Object.keys(task).sort()).toEqual(['duration', 'title']);
      expect(typeof task.duration).toBe('number');
    }
  });

  it('round-trips through the frozen v1 shape', () => {
    const result = decodeRoutinePayload(encodeRoutinePayload(routine));

    expect(result).toEqual({ ok: true, routine });
  });
});
