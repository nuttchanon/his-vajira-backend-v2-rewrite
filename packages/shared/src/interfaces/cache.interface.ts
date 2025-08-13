export interface CacheInterface {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl?: number;
}
