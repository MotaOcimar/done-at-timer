export interface SharedRoutine {
  name: string;
  tasks: {
    title: string;
    expectedDuration: number; // in minutes
  }[];
}

export type DecodeError = 'INVALID' | 'UNSUPPORTED_VERSION';

export type DecodeResult =
  | { ok: true; routine: SharedRoutine }
  | { ok: false; error: DecodeError };

// Bump only on breaking payload changes; decode keeps rejecting newer versions
// explicitly so old app builds fail with a clear error instead of garbage.
const PAYLOAD_VERSION = 1;

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const fromBase64Url = (payload: string): Uint8Array => {
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const encodeRoutinePayload = (routine: SharedRoutine): string => {
  const json = JSON.stringify({
    v: PAYLOAD_VERSION,
    name: routine.name,
    // The v1 wire key is "duration" — frozen for link compatibility,
    // whatever the field is called inside the app.
    tasks: routine.tasks.map(({ title, expectedDuration }) => ({
      title,
      duration: expectedDuration,
    })),
  });
  return toBase64Url(new TextEncoder().encode(json));
};

export const buildRoutineShareUrl = (
  routine: SharedRoutine,
  baseUrl: string,
): string => `${baseUrl}#r=${encodeRoutinePayload(routine)}`;

const parseTask = (value: unknown): SharedRoutine['tasks'][number] | null => {
  if (typeof value !== 'object' || value === null) return null;
  const { title, duration } = value as Record<string, unknown>;
  if (typeof title !== 'string' || title.trim() === '') return null;
  if (
    typeof duration !== 'number' ||
    !Number.isFinite(duration) ||
    duration <= 0
  )
    return null;
  return { title, expectedDuration: duration };
};

export const decodeRoutinePayload = (payload: string): DecodeResult => {
  let parsed: unknown;
  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(
      fromBase64Url(payload),
    );
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'INVALID' };
  }

  if (typeof parsed !== 'object' || parsed === null)
    return { ok: false, error: 'INVALID' };
  const { v, name, tasks } = parsed as Record<string, unknown>;

  if (typeof v !== 'number') return { ok: false, error: 'INVALID' };
  if (v !== PAYLOAD_VERSION) return { ok: false, error: 'UNSUPPORTED_VERSION' };

  if (typeof name !== 'string' || name.trim() === '')
    return { ok: false, error: 'INVALID' };
  if (!Array.isArray(tasks) || tasks.length === 0)
    return { ok: false, error: 'INVALID' };

  const parsedTasks: SharedRoutine['tasks'] = [];
  for (const task of tasks) {
    const parsedTask = parseTask(task);
    if (!parsedTask) return { ok: false, error: 'INVALID' };
    parsedTasks.push(parsedTask);
  }

  return { ok: true, routine: { name, tasks: parsedTasks } };
};
