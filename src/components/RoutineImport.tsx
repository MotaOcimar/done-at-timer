import { useState } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { decodeRoutinePayload } from '../utils/routineShare';
import type { DecodeResult } from '../utils/routineShare';
import { urlFragment } from '../utils/urlFragment';

const RoutineImport = () => {
  const importRoutine = useTaskStore((state) => state.importRoutine);
  const [decoded, setDecoded] = useState<DecodeResult | null>(() => {
    const payload = urlFragment.readSharePayload();
    return payload === null ? null : decodeRoutinePayload(payload);
  });

  if (!decoded) return null;

  const dismiss = () => {
    urlFragment.clearFragment();
    setDecoded(null);
  };

  const handleImport = () => {
    if (decoded.ok) {
      importRoutine(decoded.routine.name, decoded.routine.tasks);
    }
    dismiss();
  };

  if (!decoded.ok) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
          onClick={dismiss}
        />
        <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-100 max-w-sm w-full relative z-[70]">
          <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={24} strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Can't import this link
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {decoded.error === 'UNSUPPORTED_VERSION'
              ? 'This link was created by a newer version of the app. Refresh to update, then try again.'
              : 'This share link is corrupted or incomplete. Ask for a new one.'}
          </p>
          <button
            onClick={dismiss}
            className="w-full bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  const { routine } = decoded;
  const totalMinutes = routine.tasks.reduce(
    (sum, task) => sum + task.duration,
    0,
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        role="presentation"
        aria-hidden="true"
        className="fixed inset-0 bg-black/40 backdrop-blur-md"
        onClick={dismiss}
      />
      <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-blue-100 max-w-sm w-full relative z-[70]">
        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4">
          <Download size={24} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Import shared routine?
        </h3>
        <p className="font-bold text-blue-600 mb-1">{routine.name}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-4">
          {routine.tasks.length} tasks • {totalMinutes}m
        </p>
        <ul className="mb-6 max-h-48 overflow-y-auto space-y-2">
          {routine.tasks.map((task, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 text-sm"
            >
              <span className="text-gray-700 truncate">{task.title}</span>
              <span className="text-gray-400 font-bold ml-3 shrink-0">
                {task.duration}m
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            className="flex-1 bg-blue-500 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
          >
            Import
          </button>
          <button
            onClick={dismiss}
            className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export { RoutineImport };
