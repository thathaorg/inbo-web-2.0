/**
 * Advanced Caching System for Inbo Web App
 * 
 * Features:
 * - In-memory caching with TTL (Time To Live)
 * - localStorage persistence for offline support
 * - Automatic cache invalidation
 * - Request deduplication (prevents duplicate API calls)
 * - Stale-while-revalidate pattern
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface PendingRequest<T> {
    promise: Promise<T>;
    timestamp: number;
}

// Default TTL values (in milliseconds)
export const CACHE_TTL = {
    SHORT: 30 * 1000,          // 30 seconds - for rapidly changing data
    MEDIUM: 2 * 60 * 1000,     // 2 minutes - for inbox list
    LONG: 10 * 60 * 1000,      // 10 minutes - for email details
    VERY_LONG: 30 * 60 * 1000, // 30 minutes - for static data like categories
    PERMANENT: 24 * 60 * 60 * 1000, // 24 hours - for rarely changing data
} as const;

class CacheManager {
    private memoryCache: Map<string, CacheEntry<any>> = new Map();
    private pendingRequests: Map<string, PendingRequest<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly STORAGE_PREFIX = 'inbo_cache_';

    constructor() {
        // Start periodic cleanup every 5 minutes
        if (typeof window !== 'undefined') {
            this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
        }
    }

    /**
     * Generate a cache key from endpoint and params
     */
    generateKey(endpoint: string, params?: Record<string, any>): string {
        const paramStr = params ? JSON.stringify(params) : '';
        return `${endpoint}:${paramStr}`;
    }

    /**
     * Get data from cache (memory first, then localStorage)
     */
    get<T>(key: string): T | null {
        // Check memory cache first
        const memEntry = this.memoryCache.get(key);
        if (memEntry) {
            if (this.isValid(memEntry)) {
                return memEntry.data as T;
            } else {
                this.memoryCache.delete(key);
            }
        }

        // Check localStorage
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
                if (stored) {
                    const entry: CacheEntry<T> = JSON.parse(stored);
                    if (this.isValid(entry)) {
                        // Restore to memory cache
                        this.memoryCache.set(key, entry);
                        return entry.data;
                    } else {
                        localStorage.removeItem(this.STORAGE_PREFIX + key);
                    }
                }
            } catch (e) {
                // localStorage might be full or disabled
                console.warn('Cache localStorage error:', e);
            }
        }

        return null;
    }

    /**
     * Check if a cache entry is still valid
     */
    isValid<T>(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp < entry.ttl;
    }

    /**
     * Check if data is stale but still usable (for stale-while-revalidate)
     */
    isStale<T>(entry: CacheEntry<T>): boolean {
        const age = Date.now() - entry.timestamp;
        return age > entry.ttl * 0.7; // Consider stale after 70% of TTL
    }

    /**
     * Set data in cache
     */
    set<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM, persist: boolean = false): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
        };

        this.memoryCache.set(key, entry);

        // Persist to localStorage if requested
        if (persist && typeof window !== 'undefined') {
            try {
                localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
            } catch (e) {
                // localStorage might be full
                console.warn('Could not persist cache to localStorage:', e);
                this.cleanupLocalStorage();
            }
        }
    }

    /**
     * Invalidate (delete) a specific cache entry
     */
    invalidate(key: string): void {
        this.memoryCache.delete(key);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.STORAGE_PREFIX + key);
        }
    }

    /**
     * Invalidate all cache entries matching a prefix
     */
    invalidatePrefix(prefix: string): void {
        // Clear memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                this.memoryCache.delete(key);
            }
        }

        // Clear localStorage
        if (typeof window !== 'undefined') {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX + prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
    }

    /**
     * Invalidate all cache
     */
    invalidateAll(): void {
        this.memoryCache.clear();
        this.pendingRequests.clear();

        if (typeof window !== 'undefined') {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
    }

    /**
     * Deduplicate requests - if the same request is in flight, return the existing promise
     */
    deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
        // Check if request is already in flight
        const pending = this.pendingRequests.get(key);
        if (pending && Date.now() - pending.timestamp < 10000) { // 10 second max for pending
            return pending.promise;
        }

        // Create new request
        const promise = requestFn().finally(() => {
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, {
            promise,
            timestamp: Date.now(),
        });

        return promise;
    }

    /**
     * Fetch with cache - implements stale-while-revalidate pattern
     */
    async fetchWithCache<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options: {
            ttl?: number;
            persist?: boolean;
            forceRefresh?: boolean;
            staleWhileRevalidate?: boolean;
        } = {}
    ): Promise<T> {
        const {
            ttl = CACHE_TTL.MEDIUM,
            persist = false,
            forceRefresh = false,
            staleWhileRevalidate = true,
        } = options;

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = this.get<T>(key);
            if (cached !== null) {
                const memEntry = this.memoryCache.get(key);

                // If using stale-while-revalidate and data is stale, refresh in background
                if (staleWhileRevalidate && memEntry && this.isStale(memEntry)) {
                    this.deduplicateRequest(key + ':revalidate', async () => {
                        try {
                            const freshData = await fetchFn();
                            this.set(key, freshData, ttl, persist);
                        } catch (e) {
                            console.warn('Background revalidation failed:', e);
                        }
                        return null;
                    });
                }

                return cached;
            }
        }

        // Deduplicate and fetch
        const data = await this.deduplicateRequest(key, fetchFn);
        this.set(key, data, ttl, persist);
        return data;
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();

        // Clean memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.memoryCache.delete(key);
            }
        }

        // Clean pending requests older than 30 seconds
        for (const [key, pending] of this.pendingRequests.entries()) {
            if (now - pending.timestamp > 30000) {
                this.pendingRequests.delete(key);
            }
        }
    }

    /**
     * Cleanup localStorage when storage is full
     */
    private cleanupLocalStorage(): void {
        if (typeof window === 'undefined') return;

        const entries: { key: string; timestamp: number }[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.STORAGE_PREFIX)) {
                try {
                    const entry = JSON.parse(localStorage.getItem(key) || '{}');
                    entries.push({ key, timestamp: entry.timestamp || 0 });
                } catch {
                    // Invalid entry, remove it
                    localStorage.removeItem(key);
                }
            }
        }

        // Sort by timestamp (oldest first) and remove oldest 20%
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = Math.ceil(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(entries[i].key);
        }
    }

    /**
     * Get cache stats for debugging
     */
    getStats(): { memorySize: number; pendingRequests: number } {
        return {
            memorySize: this.memoryCache.size,
            pendingRequests: this.pendingRequests.size,
        };
    }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Cache keys for different data types
export const CACHE_KEYS = {
    INBOX: 'inbox',
    INBOX_PAGE: (page: number, isRead?: boolean) => `inbox:${isRead}:${page}`,
    EMAIL_DETAIL: (id: string) => `email:${id}`,
    READ_LATER: 'read-later',
    FAVORITES: 'favorites',
    TRASH: 'trash',
    CATEGORIES: 'categories',
    USER_PROFILE: 'user-profile',
    ANALYTICS_SNAPSHOT: 'analytics-snapshot',
    ANALYTICS_CHART: (days: number) => `analytics-chart:${days}`,
    NEWSLETTER_PROVIDER: (sender: string) => `provider:${sender.toLowerCase()}`,
} as const;

export default cacheManager;
