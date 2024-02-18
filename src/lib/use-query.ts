import { useEffect, useState } from 'preact/hooks';
import { useClientContext } from './ClientContext.tsx';

type QueryState<TData, TError = unknown> = {
  data?: TData;
  isLoading: boolean;
  error?: TError;
};

export function useQuery<TResult = unknown>(
  cacheKey: string,
  queryFn: () => Promise<Response>,
) {
  const [query, setQuery] = useState<QueryState<TResult>>({
    isLoading: false,
  });
  const { cache } = useClientContext();

  const fetchQuery = async () => {
    try {
      const cachedData = cache.get<TResult>(cacheKey);
      if (cachedData !== null) {
        setQuery({ data: cachedData, isLoading: false });
        return;
      }

      setQuery({ isLoading: true });
      const result = await queryFn();
      if (result instanceof Response) {
        const data = await result.json();
        setQuery({ data, isLoading: false });
        cache.set(cacheKey, data, { lifeTime: 5 });
      }
    } catch (error) {
      setQuery({ error, isLoading: false });
    }
  };

  useEffect(() => {
    fetchQuery().finally();
  }, []);

  return query;
}
