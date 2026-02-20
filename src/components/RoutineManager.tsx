import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';

const RoutineManager = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const routines = useTaskStore((state) => state.routines);
  const saveRoutine = useTaskStore((state) => state.saveRoutine);
  const loadRoutine = useTaskStore((state) => state.loadRoutine);
  const deleteRoutine = useTaskStore((state) => state.deleteRoutine);

  const [isSaving, setIsSaving] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [showRoutines, setShowRoutines] = useState(false);
  const [confirmLoadId, setConfirmLoadId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (routineName.trim()) {
      saveRoutine(routineName.trim());
      setRoutineName('');
      setIsSaving(false);
    }
  };

  const initiateLoad = (id: string) => {
    if (tasks.length > 0) {
      setConfirmLoadId(id);
    } else {
      loadRoutine(id);
      setShowRoutines(false);
    }
  };

  const confirmLoad = () => {
    if (confirmLoadId) {
      loadRoutine(confirmLoadId);
      setConfirmLoadId(null);
      setShowRoutines(false);
    }
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteRoutine(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="mb-8 relative">
      {/* Custom Confirmation Modal (Load) */}
      {confirmLoadId && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-blue-100 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Replace current tasks?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Loading this routine will clear your current list. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmLoad}
                className="flex-1 bg-blue-500 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                Yes, Load
              </button>
              <button
                onClick={() => setConfirmLoadId(null)}
                className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Delete) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-100 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete this routine?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove this routine? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowRoutines(!showRoutines)}
          className="text-xs font-black text-blue-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {showRoutines ? 'Hide Saved Routines' : `Saved Routines (${routines.length})`}
        </button>

        {tasks.length > 0 && !isSaving && (
          <button
            onClick={() => setIsSaving(true)}
            className="text-xs font-black text-green-400 hover:text-green-600 uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Save Current
          </button>
        )}
      </div>

      {isSaving && (
        <form onSubmit={handleSave} className="bg-green-50/50 border border-green-100 p-4 rounded-xl mb-4 animate-in fade-in zoom-in-95 duration-200">
          <label className="block text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
            Routine Name
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Morning Routine"
              className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-100"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsSaving(false)}
              className="text-gray-400 hover:text-gray-600 px-2 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showRoutines && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {routines.length === 0 ? (
            <div className="col-span-full py-6 text-center text-gray-400 text-sm italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              No routines saved yet.
            </div>
          ) : (
            routines.map((routine) => (
              <div 
                key={routine.id} 
                onClick={() => initiateLoad(routine.id)}
                className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-700 text-sm truncate group-hover:text-blue-600 transition-colors">{routine.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                    {routine.tasks.length} tasks • {routine.tasks.reduce((sum, t) => sum + t.duration, 0)} min total
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-2 text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => initiateDelete(e, routine.id)}
                    className="p-2 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-lg transition-colors"
                    title="Delete Routine"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoutineManager;
