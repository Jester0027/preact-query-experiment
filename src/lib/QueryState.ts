export type QueryState<TData, TError = unknown> = {
  data?: TData;
  isLoading: boolean;
  error?: TError;
};
