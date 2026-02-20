import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';

interface RoutineManagerProps {
  isOpen: boolean;
  onClose: () => void;
  isSavingExternal?: boolean;
  onSaveComplete?: () => void;
}

const RoutineManager = ({ isOpen, onClose, isSavingExternal, onSaveComplete }: RoutineManagerProps) => {
  const tasks = useTaskStore((state) => state.tasks);
  const routines = useTaskStore((state) => state.routines);
  const saveRoutine = useTaskStore((state) => state.saveRoutine);
  const loadRoutine = useTaskStore((state) => state.loadRoutine);
  const deleteRoutine = useTaskStore((state) => state.deleteRoutine);

  const [routineName, setRoutineName] = useState('');
  const [confirmLoadId, setConfirmLoadId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (routineName.trim()) {
      saveRoutine(routineName.trim());
      setRoutineName('');
      if (onSaveComplete) onSaveComplete();
    }
  };

  const handleCancelSave = () => {
    setRoutineName('');
    if (onSaveComplete) onSaveComplete();
  };

  const initiateLoad = (id: string) => {
    if (tasks.length > 0) {
      setConfirmLoadId(id);
    } else {
      loadRoutine(id);
      onClose();
    }
  };

  const confirmLoad = () => {
    if (confirmLoadId) {
      loadRoutine(confirmLoadId);
      setConfirmLoadId(null);
      onClose();
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

  if (!isOpen && !confirmLoadId && !confirmDeleteId && !isSavingExternal) return null;

  return (
    <>
      {/* Backdrop for Drawer and External Save Modal */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen || isSavingExternal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={isSavingExternal ? handleCancelSave : onClose}
      />

      {/* Save Routine Modal (External Trigger) */}
      {isSavingExternal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave} 
            className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-green-100 max-w-sm w-full"
          >
            <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Save Routine</h3>
            <p className="text-gray-500 text-sm mb-4">Give a name to your current list of tasks.</p>
            
            <input
              autoFocus
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Morning Focus"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelSave}
                className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Your Routines</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* List Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest">Saved Libraries</h3>
              {routines.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-3xl">
                  No routines yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {routines.map((routine) => (
                    <div 
                      key={routine.id} 
                      onClick={() => initiateLoad(routine.id)}
                      className="group flex items-center justify-between p-4 bg-gray-50 border border-transparent rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{routine.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          {routine.tasks.length} tasks • {routine.tasks.reduce((sum, t) => sum + t.duration, 0)}m
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="p-2 text-blue-500 opacity-60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <button
                          onClick={(e) => initiateDelete(e, routine.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modals */}
      {confirmLoadId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirmLoadId(null)} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-blue-100 max-w-sm w-full relative z-[70]">
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

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirmDeleteId(null)} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-100 max-w-sm w-full relative z-[70]">
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
    </>
  );
};

export { RoutineManager };
