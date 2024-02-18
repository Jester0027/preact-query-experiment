export type CacheOptions = {
  lifeTime: number;
};

export type CachedValue<T = unknown> = { value: T; options: CacheOptions };
export type SetCachedValueFunction<T> = () => T | Promise<T>;

export interface CacheInterface {
  get<T = unknown>(key: string): T | null;

  getOrSet<T = unknown>(
    key: string,
    factory: SetCachedValueFunction<T>,
    options: CacheOptions,
  ): Promise<T>;

  set<T = unknown>(key: string, value: T, options: CacheOptions): void;

  unset(key: string): void;

  removePrefixed(prefix: string): void;
}

export type CacheConfig = {
  cleanPollingInterval: number;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export class MemCache implements CacheInterface {
  readonly #cache = new Map<string, CachedValue>();
  readonly #defaultConfig: CacheConfig = {
    cleanPollingInterval: 5 * MINUTE,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.#defaultConfig = { ...this.#defaultConfig, ...config };
    setInterval(() => {
      console.log('cleaning up cache');
      this.#cache.forEach((value, key) => {
        if (value.options.lifeTime < Date.now()) {
          this.#cache.delete(key);
        }
      });
    }, this.#defaultConfig.cleanPollingInterval);
  }

  public get<T = unknown>(key: string): T | null {
    const target = this.#cache.get(key) as CachedValue<T>;
    if (target === undefined) return null;
    const {
      options: { lifeTime },
      value,
    } = target;
    if (Date.now() > lifeTime) {
      this.unset(key);
      return null;
    }
    return value;
  }

  public async getOrSet<T = unknown>(
    key: string,
    factory: SetCachedValueFunction<T>,
    options: CacheOptions,
  ): Promise<T> {
    let value = this.get<T>(key);
    if (value) return value;

    const data = await factory();
    this.set(key, data, options);
    return data;
  }

  public set<T = any>(key: string, value: T, options: CacheOptions): void {
    this.#cache.set(key, {
      options: {
        ...options,
        lifeTime: Date.now() + options.lifeTime * SECOND,
      },
      value: value,
    });
  }

  public unset(key: string) {
    this.#cache.delete(key);
  }

  public removePrefixed(prefix: string) {
    Object.keys(this.#cache).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.#cache.delete(key);
      }
    });
  }
}
