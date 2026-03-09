import React from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isIOS, promptInstall, hideInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  const handleInstallClick = async () => {
    await promptInstall();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 md:w-80 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 z-50 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">Install App</h3>
          {isIOS ? (
            <p className="text-xs text-slate-500">Tap <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-[-4px]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span> Share and then "Add to Home Screen".</p>
          ) : (
            <p className="text-xs text-slate-500">Add to home screen for quick access.</p>
          )}
        </div>
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95 cursor-pointer"
          >
            Install
          </button>
        )}
        <button
          onClick={hideInstall}
          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
};
