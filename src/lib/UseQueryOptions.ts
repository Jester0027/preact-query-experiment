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

export const defaultOptions: UseQueryOptions = {
  immediate: true,
  lifetime: 180,
  disableCache: false,
};
