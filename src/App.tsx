import Layout from './components/Layout';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import ArrivalDisplay from './components/ArrivalDisplay';
import ActiveTask from './components/ActiveTask';
import RoutineProgress from './components/RoutineProgress';

function App() {
  return (
    <Layout>
      <div className="flex flex-col">
        <ArrivalDisplay />
        <ActiveTask />
        <RoutineProgress />

        <div className="mt-8 pt-8 border-t border-gray-100">
          <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-6 text-center">
            Plan your routine
          </h2>
          <TaskInput />
          <TaskList />
        </div>
      </div>
    </Layout>
  );
}

export default App;
