import { ComponentChildren, createContext } from 'preact';
import { MemCache } from './MemCache.ts';
import { useContext, useRef } from 'preact/hooks';

type ClientContext = {
  cache: MemCache;
};

const ClientContext = createContext<ClientContext | null>(null);

const _cache = new MemCache({ cleanPollingInterval: 1000 * 5 });

export function ClientContextProvider({
  children,
}: {
  children: ComponentChildren;
}) {
  const cache = useRef(_cache);

  return (
    <ClientContext.Provider value={{ cache: cache.current }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);

  if (!context) {
    throw new Error(
      'The useQuery hook must be used within a ClientContextProvider.',
    );
  }

  return context;
}
