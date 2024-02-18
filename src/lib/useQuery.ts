import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useClientContext } from './ClientContext.tsx';
import { defaultOptions, UseQueryOptions } from './UseQueryOptions.ts';
import { QueryState } from './QueryState.ts';
import { CacheKey, resolveCacheKey } from './helpers/resolveCacheKey.ts';

export function useQuery<TResult = unknown>(
  cacheKey: CacheKey,
  queryFn: () => Promise<Response>,
  options?: UseQueryOptions,
) {
  const { cache } = useClientContext();
  const [query, setQuery] = useState<QueryState<TResult>>({
    isLoading: false,
  });

  const _cacheKey = useMemo(() => resolveCacheKey(cacheKey), []);

  const { lifetime, immediate, disableCache } = {
    ...defaultOptions,
    ...options,
  };

  const runQuery = useCallback(async () => {
    try {
      if (!disableCache) {
        const cachedData = cache.get<TResult>(_cacheKey);
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
          cache.set(_cacheKey, data, { lifeTime: lifetime! });
        }
      }
    } catch (error) {
      setQuery({ error, isLoading: false });
    }
  }, [cache, setQuery, queryFn]);

  const invalidate = useCallback(() => {
    cache.unset(_cacheKey);
  }, [cache, _cacheKey]);

  const revalidate = useCallback(async () => {
    invalidate();
    await runQuery();
  }, [invalidate, runQuery]);

  useEffect(() => {
    if (immediate) {
      runQuery().finally();
    }
  }, []);

  return { ...query, runQuery, invalidate, revalidate };
}
