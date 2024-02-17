import { useEffect, useState } from 'preact/hooks';

type QueryState<TData, TError = unknown> = {
  data?: TData;
  isLoading: boolean;
  error?: TError;
};

export function useQuery<TResult = unknown>(
  // @ts-ignore
  cacheKey: string,
  queryFn: () => Promise<Response>,
) {
  const [query, setQuery] = useState<QueryState<TResult>>({
    isLoading: false,
  });

  const fetchQuery = async () => {
    try {
      setQuery({ isLoading: true });
      const result = await queryFn();
      if (result instanceof Response) {
        const data = await result.json();
        setQuery({ data, isLoading: false });
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
