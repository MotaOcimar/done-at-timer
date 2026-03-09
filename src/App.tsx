import { useState } from 'react';
import { Layout } from './components/Layout';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { ArrivalDisplay } from './components/ArrivalDisplay';
import { ControlCenter } from './components/ControlCenter';
import { InstallPrompt } from './components/InstallPrompt';
import { NotificationBell } from './components/NotificationBell';

import { NotificationProvider } from './NotificationContext';
import { NotificationManager } from './components/NotificationManager';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';

function App() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSavingActive, setIsSavingActive] = useState(false);

  return (
    <NotificationProvider>
      <Layout>
        <NotificationManager />
        <PWAUpdateNotification />
        <div className="flex flex-col relative">
        {/* Sticky Header - Simples e Limpo */}
        <div className="sticky top-0 z-30 bg-gray-50 -mx-4 px-4 pt-3 pb-6 pointer-events-none">
          <div className="relative pointer-events-auto">
            <ArrivalDisplay />
            <div className="absolute top-4 right-4">
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <TaskList 
            onSaveRoutine={() => setIsSavingActive(true)} 
            onLoadRoutine={() => setIsLibraryOpen(true)}
          />
          <div className="mt-6">
            <TaskInput />
          </div>
        </div>

        <ControlCenter 
          isOpen={isLibraryOpen} 
          onClose={() => setIsLibraryOpen(false)}
          isSavingExternal={isSavingActive}
          onSaveComplete={() => setIsSavingActive(false)}
        />
        
        <InstallPrompt />
      </div>
    </Layout>
    </NotificationProvider>
  );
}

export { App };
