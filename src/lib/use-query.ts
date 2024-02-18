import { useCallback, useEffect, useState } from 'preact/hooks';
import { useClientContext } from './ClientContext.tsx';

type QueryState<TData, TError = unknown> = {
  data?: TData;
  isLoading: boolean;
  error?: TError;
};

export type UseQueryOptions = {
  /**
   * @desc if true, the query will be executed immediately
   * @default true
   */
  immediate?: boolean;
  /**
   * @desc in seconds
   * @default 180
   */
  lifetime?: number;
  disableCache?: boolean;
};

const defaultOptions: UseQueryOptions = {
  immediate: true,
  lifetime: 180,
  disableCache: false,
};

export function useQuery<TResult = unknown>(
  cacheKey: string,
  queryFn: () => Promise<Response>,
  options?: UseQueryOptions,
) {
  const [query, setQuery] = useState<QueryState<TResult>>({
    isLoading: false,
  });
  const { cache } = useClientContext();

  const { lifetime, immediate, disableCache } = {
    ...defaultOptions,
    ...options,
  };

  const runQuery = useCallback(async () => {
    try {
      if (!disableCache) {
        const cachedData = cache.get<TResult>(cacheKey);
        if (cachedData !== null) {
          setQuery({ data: cachedData, isLoading: false });
          return;
        }
      }

      setQuery({ isLoading: true });
      const result = await queryFn();
      if (result instanceof Response) {
        const data: TResult = await result.json();
        setQuery({ data, isLoading: false });
        if (!disableCache) {
          cache.set(cacheKey, data, { lifeTime: lifetime! });
        }
      }
    } catch (error) {
      setQuery({ error, isLoading: false });
    }
  }, [cache, setQuery, queryFn]);

  useEffect(() => {
    if (immediate) {
      runQuery().finally();
    }
  }, []);

  return { ...query, revalidate: runQuery };
}
