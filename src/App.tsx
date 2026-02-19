import Layout from './components/Layout';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';

function App() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Done-At Timer</h1>
      <TaskInput />
      <TaskList />
    </Layout>
  );
}

export default App;
