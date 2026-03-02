import { useState } from 'react';
import { Layout } from './components/Layout';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { ArrivalDisplay } from './components/ArrivalDisplay';
import { RoutineManager } from './components/RoutineManager';
import { InstallPrompt } from './components/InstallPrompt';

function App() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSavingActive, setIsSavingActive] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col relative">
        {/* Sticky Header - Simples e Limpo */}
        <div className="sticky top-0 z-50 bg-gray-50 -mx-4 px-4 pt-3 pb-6 pointer-events-none">
          <div className="pointer-events-auto">
            <ArrivalDisplay />
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

        <RoutineManager 
          isOpen={isLibraryOpen} 
          onClose={() => setIsLibraryOpen(false)}
          isSavingExternal={isSavingActive}
          onSaveComplete={() => setIsSavingActive(false)}
        />
        
        <InstallPrompt />
      </div>
    </Layout>
  );
}

export { App };
