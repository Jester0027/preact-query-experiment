import { ClientContextProvider, useQuery } from './lib';
import { useState } from 'preact/hooks';
import { useQueries } from './lib/useQueries.ts';

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export function App() {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  return (
    <ClientContextProvider>
      <main class="container">
        <nav>
          <button onClick={() => setTab(0)}>First tab</button>
          <button onClick={() => setTab(1)}>Second tab</button>
          <button onClick={() => setTab(2)}>Second tab</button>
        </nav>

        {tab === 0 && <FirstTab />}
        {tab === 1 && <SecondTab />}
        {tab === 2 && <ThirdTab />}
      </main>
    </ClientContextProvider>
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
  const { data: todos, isLoading } = useQueries<[Todo, Todo, Todo]>([
    {
      cacheKey: ['todos', 1],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/1'),
    },
    {
      cacheKey: ['todos', 2],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/2'),
    },
    {
      cacheKey: ['todos', 3],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/3'),
    },
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{todos?.map((todo) => <p>{todo?.title}</p>)}</div>;
}

function ThirdTab() {
  const { data: todos, isLoading } = useQueries<[Todo, Todo, Todo, Todo]>([
    {
      cacheKey: ['todos', 1],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/1'),
    },
    {
      cacheKey: ['todos', 2],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/2'),
    },
    {
      cacheKey: ['todos', 3],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/3'),
    },
    {
      cacheKey: ['todos', 4],
      queryFn: () => fetch('https://jsonplaceholder.typicode.com/todos/4'),
    },
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{todos?.map((todo) => <p>{todo?.title}</p>)}</div>;
}
