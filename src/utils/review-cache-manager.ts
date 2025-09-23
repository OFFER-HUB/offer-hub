import {
  CacheConfig,
  CacheItem,
  Review,
  ReviewQueryKey,
} from "@/types/reviews.types";

/**
 * Default cache configuration values
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
};

/**
 * ReviewCacheManager
 *
 * Cache manager for reviews:
 * - TTL (Time-to-Live) based caching
 * - Automatic cache invalidation
 * - Cross-tab synchronization via localStorage
 * - Memory optimization with cleanup intervals
 * - Cache event subscription system
 *
 * Configuration can be provided in two ways:
 * 1. On first getInstance() call: ReviewCacheManager.getInstance(config)
 * 2. Via the configure method: ReviewCacheManager.configure(config)
 *
 * Attempting to pass config to getInstance() after the instance is created will throw an error.
 * Use configure() to update the configuration of an existing instance.
 */
class ReviewCacheManager {
  private static instance: ReviewCacheManager;
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private subscribers: Set<(key: string) => void>;
  private storageKeyPrefix = "offerhub_review_cache_";

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config: CacheConfig) {
    this.config = config;
    this.cache = new Map();
    this.subscribers = new Set();
    this.startCleanupInterval();
    this.syncWithLocalStorage();
    this.setupStorageEventListener();
  }

  /**
   * Configure the cache manager with custom settings
   * Can be called before first getInstance() to set initial config,
   * or after creation to update config of an existing instance.
   *
   * @param config - Configuration to override defaults
   */
  public static configure(config: Partial<CacheConfig>): void {
    if (!config || Object.keys(config).length === 0) {
      return; // Nothing to configure
    }

    if (ReviewCacheManager.instance) {
      // Apply config to existing instance
      ReviewCacheManager.instance.config = {
        ...ReviewCacheManager.instance.config,
        ...config,
      };

      // Restart cleanup interval with new config if needed
      if (config.cleanupInterval !== undefined) {
        ReviewCacheManager.instance.restartCleanupInterval();
      }

      console.info(
        "ReviewCacheManager configuration updated for existing instance."
      );
    } else {
      // Store config to be applied when instance is created
      ReviewCacheManager._config = { ...DEFAULT_CACHE_CONFIG, ...config };
      console.info(
        "ReviewCacheManager configuration stored for future initialization."
      );
    }
  }

  // Store configuration separately from instance
  private static _config: CacheConfig = { ...DEFAULT_CACHE_CONFIG };

  /**
   * Returns the singleton instance of the cache manager
   *
   * @param config - Optional configuration to use when creating the instance for the first time
   * @returns The ReviewCacheManager instance
   * @throws Error if config is provided when the instance already exists
   */
  public static getInstance(config?: Partial<CacheConfig>): ReviewCacheManager {
    // If config is provided and instance exists, throw clear error
    if (
      config &&
      Object.keys(config).length > 0 &&
      ReviewCacheManager.instance
    ) {
      throw new Error(
        "Cannot provide configuration to getInstance() after the instance has been created.\n" +
          "To configure before creation, call getInstance(config) only on first use.\n" +
          "To modify existing configuration, use ReviewCacheManager.configure(config) instead."
      );
    }

    if (!ReviewCacheManager.instance) {
      // Apply any config provided to getInstance on first call
      if (config && Object.keys(config).length > 0) {
        ReviewCacheManager._config = {
          ...ReviewCacheManager._config,
          ...config,
        };
      }

      ReviewCacheManager.instance = new ReviewCacheManager(
        ReviewCacheManager._config
      );
    }

    return ReviewCacheManager.instance;
  }

  /**
   * Set an item in the cache with an optional custom TTL
   */
  public set<T>(key: string | ReviewQueryKey, value: T, ttl?: number): void {
    const stringKey = this.generateKey(key);
    const cacheItem: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    };

    this.cache.set(stringKey, cacheItem);
    this.saveToLocalStorage(stringKey, cacheItem);
    this.notifySubscribers(stringKey);
  }

  /**
   * Get an item from the cache
   */
  public get<T>(key: string | ReviewQueryKey): T | null {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey) as CacheItem<T> | undefined;

    if (!item) {
      return this.getFromLocalStorage<T>(stringKey);
    }

    if (this.isExpired(item)) {
      this.delete(stringKey);
      return null;
    }

    return item.data;
  }

  /**
   * Check if a key exists and is valid in the cache
   */
  public has(key: string | ReviewQueryKey): boolean {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey);

    if (!item && typeof window !== "undefined") {
      // Try local storage
      return this.hasValidLocalStorageItem(stringKey);
    }

    return item !== undefined && !this.isExpired(item);
  }

  /**
   * Delete an item from the cache
   */
  public delete(key: string | ReviewQueryKey): void {
    const stringKey = this.generateKey(key);
    this.cache.delete(stringKey);
    this.removeFromLocalStorage(stringKey);
    this.notifySubscribers(stringKey);
  }

  /**
   * Invalidate all cache items matching a pattern
   * Example: invalidatePattern(['reviews', userId]) will invalidate all keys starting with ['reviews', userId]
   */
  public invalidatePattern(keyPattern: string | ReviewQueryKey): void {
    const pattern = this.generateKey(keyPattern);

    // Delete from memory cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.delete(key);
      }
    }

    // Delete from local storage
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storageKeyPrefix + pattern)) {
          this.removeFromLocalStorage(
            key.substring(this.storageKeyPrefix.length)
          );
        }
      }
    }
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
    this.notifySubscribers("*");
  }

  /**
   * Subscribe to cache changes
   */
  public subscribe(callback: (key: string) => void): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update TTL for an existing cache item
   */
  public updateTTL(key: string | ReviewQueryKey, ttl: number): boolean {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey);

    if (!item) return false;

    item.ttl = ttl;
    this.cache.set(stringKey, item);
    this.saveToLocalStorage(stringKey, item);
    return true;
  }

  /**
   * Extend TTL for an existing cache item by adding more time
   */
  public extendTTL(
    key: string | ReviewQueryKey,
    additionalTime: number
  ): boolean {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey);

    if (!item) return false;

    item.ttl += additionalTime;
    this.cache.set(stringKey, item);
    this.saveToLocalStorage(stringKey, item);
    return true;
  }

  /**
   * Refresh an item's timestamp (reset its expiration timer)
   */
  public refresh(key: string | ReviewQueryKey): boolean {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey);

    if (!item || this.isExpired(item)) return false;

    item.timestamp = Date.now();
    this.cache.set(stringKey, item);
    this.saveToLocalStorage(stringKey, item);
    return true;
  }

  /**
   * Get time remaining (in milliseconds) before item expires
   */
  public getTimeRemaining(key: string | ReviewQueryKey): number | null {
    const stringKey = this.generateKey(key);
    const item = this.cache.get(stringKey);

    if (!item) return null;

    const elapsed = Date.now() - item.timestamp;
    const remaining = item.ttl - elapsed;

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get all keys in the cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get the size of the cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Generate a consistent string key from various input types
   */
  private generateKey(key: string | ReviewQueryKey | any): string {
    if (typeof key === "string") {
      return key;
    }

    // Handle array keys like ['reviews', userId]
    if (Array.isArray(key)) {
      return key
        .map((k) =>
          k !== null && typeof k === "object"
            ? this.deterministicStringify(k)
            : String(k)
        )
        .join(":");
    }

    // Handle object keys
    return this.deterministicStringify(key);
  }

  /**
   * Deterministic JSON stringify implementation that sorts object keys
   * to ensure consistent output regardless of property insertion order
   *
   * @param obj - The value to stringify
   * @returns A deterministic string representation of the value
   */
  private deterministicStringify(obj: any): string {
    if (obj === null || obj === undefined) {
      return String(obj);
    }

    // Handle primitive types
    if (typeof obj !== "object") {
      return String(obj);
    }

    // Handle arrays (preserve order but process elements recursively)
    if (Array.isArray(obj)) {
      return (
        "[" +
        obj.map((item) => this.deterministicStringify(item)).join(",") +
        "]"
      );
    }

    // Handle objects (sort keys alphabetically)
    const sortedKeys = Object.keys(obj).sort();
    const parts = sortedKeys.map((key) => {
      const value = obj[key];
      return `"${key}":${this.deterministicStringify(value)}`;
    });

    return "{" + parts.join(",") + "}";
  }

  /**
   * Check if a cache item has expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Start the interval to clean up expired items
   */
  private startCleanupInterval(): void {
    if (typeof window !== "undefined" && !this.cleanupIntervalId) {
      this.cleanupIntervalId = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Stop the cleanup interval
   */
  public stopCleanupInterval(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * Restart the cleanup interval with the current configuration
   * Used when cleanup interval configuration is updated
   */
  private restartCleanupInterval(): void {
    this.stopCleanupInterval();
    this.startCleanupInterval();
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();

    // Memory cache cleanup
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }

    // Local storage cleanup
    this.cleanupLocalStorage();
  }

  /**
   * Notify subscribers of cache changes
   */
  private notifySubscribers(key: string): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(key);
      } catch (error) {
        console.error("Error in cache subscriber callback:", error);
      }
    });
  }

  /**
   * Save item to localStorage for cross-tab synchronization
   */
  private saveToLocalStorage<T>(key: string, item: CacheItem<T>): void {
    if (typeof window === "undefined") return;

    try {
      // We don't need deterministic ordering for localStorage values since they're
      // identified by key, but using our serializer ensures consistent handling
      localStorage.setItem(
        this.storageKeyPrefix + key,
        this.deterministicStringify(item)
      );
    } catch (e) {
      // Handle localStorage errors (e.g., quota exceeded)
      console.warn("Failed to save cache item to localStorage:", e);
    }
  }

  /**
   * Get item from localStorage
   */
  private getFromLocalStorage<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const itemJson = localStorage.getItem(this.storageKeyPrefix + key);
      if (!itemJson) return null;

      const item = JSON.parse(itemJson) as CacheItem<T>;

      if (this.isExpired(item)) {
        this.removeFromLocalStorage(key);
        return null;
      }

      // Add to memory cache
      this.cache.set(key, item);
      return item.data;
    } catch (_e) {
      return null;
    }
  }

  /**
   * Check if localStorage has a valid item
   */
  private hasValidLocalStorageItem(key: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      const itemJson = localStorage.getItem(this.storageKeyPrefix + key);
      if (!itemJson) return false;

      const item = JSON.parse(itemJson) as CacheItem<any>;
      return !this.isExpired(item);
    } catch (_e) {
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  private removeFromLocalStorage(key: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.storageKeyPrefix + key);
    } catch (e) {
      console.warn("Failed to remove cache item from localStorage:", e);
    }
  }

  /**
   * Clear all cache items from localStorage
   */
  private clearLocalStorage(): void {
    if (typeof window === "undefined") return;

    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storageKeyPrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Failed to clear cache from localStorage:", e);
    }
  }

  /**
   * Clean up expired items from localStorage
   */
  private cleanupLocalStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const now = Date.now();

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key?.startsWith(this.storageKeyPrefix)) continue;

        const itemJson = localStorage.getItem(key);
        if (!itemJson) continue;

        try {
          const item = JSON.parse(itemJson) as CacheItem<any>;
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid JSON, remove the item
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Error during localStorage cleanup:", e);
    }
  }

  /**
   * Set up listener for storage events from other tabs
   */
  private setupStorageEventListener(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("storage", (event) => {
      if (!event.key?.startsWith(this.storageKeyPrefix)) return;

      const cacheKey = event.key.substring(this.storageKeyPrefix.length);

      // If item was deleted
      if (!event.newValue) {
        this.cache.delete(cacheKey);
        this.notifySubscribers(cacheKey);
        return;
      }

      // If item was added or modified
      try {
        const newItem = JSON.parse(event.newValue);
        this.cache.set(cacheKey, newItem);
        this.notifySubscribers(cacheKey);
      } catch {
        // Invalid JSON
      }
    });
  }

  /**
   * Synchronize with localStorage on initialization
   */
  private syncWithLocalStorage(): void {
    if (typeof window === "undefined") return;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(this.storageKeyPrefix)) continue;

        const cacheKey = key.substring(this.storageKeyPrefix.length);
        this.getFromLocalStorage(cacheKey);
      }
    } catch (e) {
      console.warn("Error syncing with localStorage:", e);
    }
  }
}

export default ReviewCacheManager;
