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
        <div className="sticky top-0 z-50 -mx-4 pointer-events-none">
          {/* Camada de fundo (Máscara) - Parte sólida e gradiente de alta opacidade */}
          <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-0">
            <div className="bg-gray-50 h-[calc(100%-112px)]" />
            <div className="h-28 bg-gradient-to-b from-gray-50 via-gray-50/90 to-transparent" />
          </div>
          
          {/* Camada do Timer - Padding estendido para a zona de fade, compensado por margem negativa */}
          <div className="relative z-10 px-4 pt-3 pb-28 -mb-28">
            <div className="pointer-events-auto">
              <ArrivalDisplay />
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
