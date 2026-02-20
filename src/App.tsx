import { useState } from 'react';
import Layout from './components/Layout';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import ArrivalDisplay from './components/ArrivalDisplay';
import ActiveTask from './components/ActiveTask';
import RoutineManager from './components/RoutineManager';

function App() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSavingActive, setIsSavingActive] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col relative">
        <ArrivalDisplay />
        <ActiveTask />

        <div className="mt-8 pt-8 border-t border-gray-100">
          <TaskInput />
          <TaskList 
            onSaveRoutine={() => setIsSavingActive(true)} 
            onLoadRoutine={() => setIsLibraryOpen(true)}
          />
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

export default App;
