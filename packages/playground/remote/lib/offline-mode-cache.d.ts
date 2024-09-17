export declare class OfflineModeCache {
    cache: Cache;
    private hostname;
    private static instance?;
    static getInstance(): Promise<OfflineModeCache>;
    private constructor();
    removeOutdatedFiles(): Promise<boolean[]>;
    cachedFetch(request: Request): Promise<Response>;
    cacheOfflineModeAssets(): Promise<any>;
    private shouldCacheUrl;
}
