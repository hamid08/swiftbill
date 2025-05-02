export const CacheService = Symbol('CacheService');

export interface CacheService {
  setKey<T>(key: string, value: T): Promise<void>; // Accepts any type `T` for the value
  deleteKey(key: string): Promise<void>;
  getKey<T = any>(key: string): Promise<T | null>; // Returns `T` or `null`
  hSet<T>(key: string, value: T): Promise<number | null>; // Accepts any type `T` for the value
  hGet<T = any>(key: string): Promise<T | null>; // Returns `T` or `null`
  hGetAll<T = any>(key: string): Promise<T | null>; // Returns `T` or `null`
  hDel(key: string): Promise<number | null>;
}
