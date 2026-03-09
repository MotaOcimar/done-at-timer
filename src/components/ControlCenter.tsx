import { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Trash2, 
  Bell, 
  BellOff, 
  Save, 
  Download, 
  Check, 
  AlertTriangle, 
  Info,
  Ban
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useNotification } from '../hooks/useNotification';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isSavingExternal?: boolean;
  onSaveComplete?: () => void;
}

const ControlCenter = ({ isOpen, onClose, isSavingExternal, onSaveComplete }: ControlCenterProps) => {
  const tasks = useTaskStore((state) => state.tasks);
  const routines = useTaskStore((state) => state.routines);
  const saveRoutine = useTaskStore((state) => state.saveRoutine);
  const loadRoutine = useTaskStore((state) => state.loadRoutine);
  const deleteRoutine = useTaskStore((state) => state.deleteRoutine);
  const isNotificationsEnabled = useTaskStore((state) => state.isNotificationsEnabled);
  const toggleNotifications = useTaskStore((state) => state.toggleNotifications);

  const { permission, requestPermission } = useNotification();
  const { isInstallable, isIOS, isStandalone, promptInstall } = useInstallPrompt();

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
            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-500 mb-4">
              <Save size={24} strokeWidth={2} />
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
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">Control Center</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* List Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-wide">Saved Libraries</h3>
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
                          <ChevronRight size={20} strokeWidth={2} />
                        </div>
                        <button
                          onClick={(e) => initiateDelete(e, routine.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          aria-label="Delete routine"
                        >
                          <Trash2 size={20} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {permission !== 'unsupported' && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-wide">Preferences</h3>
                <div className="space-y-3">
                  {permission === 'default' && (
                    <button
                      onClick={requestPermission}
                      className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 text-white rounded-xl">
                          <Bell size={20} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-blue-700">Enable Notifications</span>
                      </div>
                      <div className="p-1 bg-white rounded-lg opacity-60 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} strokeWidth={2} className="text-blue-500" />
                      </div>
                    </button>
                  )}

                  {permission === 'granted' && (
                    <div className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${isNotificationsEnabled ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isNotificationsEnabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                          {isNotificationsEnabled ? (
                            <Bell size={20} strokeWidth={2} data-testid="icon-bell" />
                          ) : (
                            <BellOff size={20} strokeWidth={2} data-testid="icon-bell-off" />
                          )}
                        </div>
                        <span className={`font-bold transition-colors ${isNotificationsEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                          {isNotificationsEnabled ? 'Notifications Enabled' : 'Notifications Paused'}
                        </span>
                      </div>
                      <button
                        role="switch"
                        aria-checked={isNotificationsEnabled}
                        aria-label="Toggle Notifications"
                        onClick={toggleNotifications}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isNotificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  )}

                  {permission === 'denied' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-400 text-white rounded-xl">
                            <Ban size={20} strokeWidth={2} />
                          </div>
                          <span className="font-bold text-gray-500">Notifications Blocked</span>
                        </div>
                      </div>
                      <p className="px-4 text-[11px] text-gray-400 leading-relaxed italic">
                        To enable, update your browser's site settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-wide">App</h3>
              <div className="space-y-3">
                {isStandalone ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 text-white rounded-xl">
                        <Check size={20} strokeWidth={2} />
                      </div>
                      <span className="font-bold text-green-700">App Installed</span>
                    </div>
                    <div className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-white px-2 py-1 rounded-lg">
                      Native
                    </div>
                  </div>
                ) : isInstallable ? (
                  !isIOS ? (
                    <button
                      onClick={promptInstall}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 text-white rounded-xl">
                          <Download size={20} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-gray-800">Install App</span>
                      </div>
                      <div className="p-1 bg-white rounded-lg opacity-60 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} strokeWidth={2} className="text-gray-400" />
                      </div>
                    </button>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 text-white rounded-xl">
                          <Download size={20} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-blue-700">Install on iOS</span>
                      </div>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        Tap the share icon and select <span className="font-black">"Add to Home Screen"</span> to install Done-At Timer.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="p-2 bg-gray-400 text-white rounded-xl">
                        <AlertTriangle size={20} strokeWidth={2} />
                      </div>
                      <span className="font-bold text-gray-500">Installation not available</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modals */}
      {confirmLoadId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirmLoadId(null)} />
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-blue-100 max-w-sm w-full relative z-[70]">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4">
              <Info size={24} strokeWidth={2} />
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
            <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center text-red-500 mb-4">
              <Trash2 size={24} strokeWidth={2} />
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

export { ControlCenter };
