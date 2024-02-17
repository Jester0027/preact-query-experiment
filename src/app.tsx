import { useQuery } from './lib';
import { useState } from 'preact/hooks';

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export function App() {
  const [tab, setTab] = useState<0 | 1>(0);

  return (
    <main class="container">
      <nav>
        <button onClick={() => setTab(0)}>First tab</button>
        <button onClick={() => setTab(1)}>Second tab</button>
      </nav>

      {tab === 0 && <FirstTab />}
      {tab === 1 && <SecondTab />}
    </main>
  );
}

function FirstTab() {
  const { data, isLoading } = useQuery<Todo[]>('todos', () =>
    fetch('https://jsonplaceholder.typicode.com/todos'),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data?.map((todo) => (
        <div style={{ marginTop: '1rem' }}>
          <input type="checkbox" checked={todo.completed} disabled />
          {todo.title}
        </div>
      ))}
    </div>
  );
}

function SecondTab() {
  return <div>Second tab</div>;
}
