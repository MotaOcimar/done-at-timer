import { useState } from 'react';
import { Layout } from './components/Layout';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { ArrivalDisplay } from './components/ArrivalDisplay';
import { RoutineManager } from './components/RoutineManager';

function App() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSavingActive, setIsSavingActive] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col relative">
        <div className="sticky top-0 z-50 bg-gray-50 -mx-4 px-4 pt-3 pb-12 -mb-12 pointer-events-none">
          <div className="pointer-events-auto">
            <ArrivalDisplay />
          </div>
          {/* Neblina / Gradient Fade */}
          <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
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
      </div>
    </Layout>
  );
}

export { App };
