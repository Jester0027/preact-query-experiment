import { defaultOptions, UseQueryOptions } from './UseQueryOptions.ts';
import { useClientContext } from './ClientContext.tsx';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { QueryState } from './QueryState.ts';
import { CacheKey, resolveCacheKey } from './helpers/resolveCacheKey.ts';

export type UseQueriesOptions = UseQueryOptions & {
  /**
   * @desc The strategy to use when resolving the promises
   * @default 'allSettled'
   */
  strategy?: 'allSettled' | 'all';
};

const defaultQueriesOptions: UseQueriesOptions = {
  ...defaultOptions,
  strategy: 'allSettled',
};

type Query = {
  cacheKey: CacheKey;
  queryFn: () => Promise<Response>;
};

export function useQueries<TResult extends any[]>(
  queries: Query[],
  options?: UseQueriesOptions,
) {
  type TNullableResult = (TResult[number] | null)[];
  const { cache } = useClientContext();
  const { lifetime, immediate, disableCache, strategy } = {
    ...defaultQueriesOptions,
    ...options,
  };
  const [queryState, setQueryState] = useState<QueryState<TNullableResult>>({
    isLoading: false,
  });

  const runQuery = useCallback(async () => {
    try {
      let cachedQueries:
        | (Query & { cachedValue: TResult[number] | null })[]
        | undefined;
      let remainingQueriesToCache:
        | (Query & { cachedValue: TResult[number] | null })[]
        | undefined;
      if (!disableCache) {
        cachedQueries = queries.map((query) => ({
          ...query,
          cachedValue: cache.get<TResult[number]>(
            resolveCacheKey(query.cacheKey),
          ),
        }));

        if (cachedQueries.every((query) => query.cachedValue !== null)) {
          const result: TNullableResult = cachedQueries.map(
            (query) => query.cachedValue,
          );
          setQueryState({
            data: result,
            isLoading: false,
          });
          return;
        }

        remainingQueriesToCache = cachedQueries.filter(
          (query) => query.cachedValue === null,
        );
      }

      setQueryState({ isLoading: true });
      let result: TNullableResult;
      let data: TNullableResult;
      switch (strategy) {
        case 'allSettled': {
          result = await Promise.allSettled(
            (remainingQueriesToCache ?? queries).map((query) =>
              query.queryFn(),
            ),
          );
          data = await Promise.allSettled(
            result.map((r) =>
              r?.status === 'fulfilled' ? r.value.json() : null,
            ),
          );
          data = data.map((d) => (d?.status === 'fulfilled' ? d.value : null));
          break;
        }
        case 'all':
        default: {
          result = await Promise.all(
            (remainingQueriesToCache ?? queries).map((query) =>
              query.queryFn(),
            ),
          );
          data = await Promise.all(result.map((r) => r?.json()));
          break;
        }
      }
      if (!disableCache) {
        remainingQueriesToCache = remainingQueriesToCache?.map(
          (query, index) => {
            cache.set(resolveCacheKey(query.cacheKey), data[index], {
              lifeTime: lifetime!,
            });
            return { ...query, cachedValue: data[index] };
          },
        );
        data = cachedQueries?.map((query) => {
          const queryToMutate = remainingQueriesToCache?.find(
            (q) => q.cacheKey === query.cacheKey,
          );
          if (queryToMutate) {
            query.cachedValue = queryToMutate.cachedValue;
          }
          return query.cachedValue!;
        })!;
      }
      setQueryState({ data, isLoading: false });
    } catch (error) {
      setQueryState({ error, isLoading: false });
    }
  }, [cache, setQueryState, queries]);

  useEffect(() => {
    if (immediate) {
      runQuery().finally();
    }
  }, []);

  return { ...queryState };
}
