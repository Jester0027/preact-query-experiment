import { ComponentChildren, createContext } from 'preact';
import { MemCache } from './MemCache.ts';
import { useContext, useMemo } from 'preact/hooks';

type ClientContext = {
  cache: MemCache;
};

const ClientContext = createContext<ClientContext | null>(null);

export type ClientContextProviderProps = {
  children: ComponentChildren;
  cacheCleanPollingInterval?: number;
};

/**
 * @public
 * @description Holds the cache instance and provides it to the useQuery hook.
 * @param children
 * @param cacheCleanPollingInterval
 * @constructor
 */
export function ClientContextProvider({
  children,
  cacheCleanPollingInterval = 1000 * 60 * 5,
}: ClientContextProviderProps) {
  const cache = useMemo(
    () => new MemCache({ cleanPollingInterval: cacheCleanPollingInterval }),
    [],
  );

  return (
    <ClientContext.Provider value={{ cache }}>
      {children}
    </ClientContext.Provider>
  );
}

/**
 * @internal
 */
export function useClientContext() {
  const context = useContext(ClientContext);

  if (!context) {
    throw new Error(
      'The useQuery hook must be used within a ClientContextProvider.',
    );
  }

  return context;
}
