import { ProgressTracker } from '@php-wasm/progress';
import { UniversalPHP } from '@php-wasm/universal';
import { Semaphore } from '@php-wasm/util';
export declare const ResourceTypes: readonly ["vfs", "literal", "wordpress.org/themes", "wordpress.org/plugins", "url"];
export type VFSReference = {
    /** Identifies the file resource as Virtual File System (VFS) */
    resource: 'vfs';
    /** The path to the file in the VFS */
    path: string;
};
export type LiteralReference = {
    /** Identifies the file resource as a literal file */
    resource: 'literal';
    /** The name of the file */
    name: string;
    /** The contents of the file */
    contents: string | Uint8Array;
};
export type CoreThemeReference = {
    /** Identifies the file resource as a WordPress Core theme */
    resource: 'wordpress.org/themes';
    /** The slug of the WordPress Core theme */
    slug: string;
};
export type CorePluginReference = {
    /** Identifies the file resource as a WordPress Core plugin */
    resource: 'wordpress.org/plugins';
    /** The slug of the WordPress Core plugin */
    slug: string;
};
export type UrlReference = {
    /** Identifies the file resource as a URL */
    resource: 'url';
    /** The URL of the file */
    url: string;
    /** Optional caption for displaying a progress message */
    caption?: string;
};
export type FileReference = VFSReference | LiteralReference | CoreThemeReference | CorePluginReference | UrlReference;
export declare function isFileReference(ref: any): ref is FileReference;
export interface ResourceOptions {
    /** Optional semaphore to limit concurrent downloads */
    semaphore?: Semaphore;
    progress?: ProgressTracker;
}
export declare abstract class Resource {
    /** Optional progress tracker to monitor progress */
    abstract progress?: ProgressTracker;
    /** A Promise that resolves to the file contents */
    protected promise?: Promise<File>;
    protected playground?: UniversalPHP;
    /**
     * Creates a new Resource based on the given file reference
     *
     * @param ref The file reference to create the Resource for
     * @param options Additional options for the Resource
     * @returns A new Resource instance
     */
    static create(ref: FileReference, { semaphore, progress }: ResourceOptions): Resource;
    setPlayground(playground: UniversalPHP): void;
    /**
     * Resolves the file contents
     * @returns The resolved file.
     */
    abstract resolve(): Promise<File>;
    /** The name of the referenced file */
    abstract get name(): string;
    /** Whether this Resource is loaded asynchronously */
    get isAsync(): boolean;
}
/**
 * A `Resource` that represents a file in the VFS (virtual file system) of the
 * playground.
 */
export declare class VFSResource extends Resource {
    private resource;
    progress?: ProgressTracker | undefined;
    /**
     * Creates a new instance of `VFSResource`.
     * @param playground The playground client.
     * @param resource The VFS reference.
     * @param progress The progress tracker.
     */
    constructor(resource: VFSReference, progress?: ProgressTracker | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A `Resource` that represents a literal file.
 */
export declare class LiteralResource extends Resource {
    private resource;
    progress?: ProgressTracker | undefined;
    /**
     * Creates a new instance of `LiteralResource`.
     * @param resource The literal reference.
     * @param progress The progress tracker.
     */
    constructor(resource: LiteralReference, progress?: ProgressTracker | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /** @inheritDoc */
    get name(): string;
}
/**
 * A base class for `Resource`s that require fetching data from a remote URL.
 */
export declare abstract class FetchResource extends Resource {
    progress?: ProgressTracker | undefined;
    /**
     * Creates a new instance of `FetchResource`.
     * @param progress The progress tracker.
     */
    constructor(progress?: ProgressTracker | undefined);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /**
     * Gets the URL to fetch the data from.
     * @returns The URL.
     */
    protected abstract getURL(): string;
    /**
     * Gets the caption for the progress tracker.
     * @returns The caption.
     */
    protected get caption(): string;
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    get isAsync(): boolean;
}
/**
 * A `Resource` that represents a file available from a URL.
 */
export declare class UrlResource extends FetchResource {
    private resource;
    /**
     * Creates a new instance of `UrlResource`.
     * @param resource The URL reference.
     * @param progress The progress tracker.
     */
    constructor(resource: UrlReference, progress?: ProgressTracker);
    /** @inheritDoc */
    getURL(): string;
    /** @inheritDoc */
    protected get caption(): string;
}
/**
 * A `Resource` that represents a WordPress core theme.
 */
export declare class CoreThemeResource extends FetchResource {
    private resource;
    constructor(resource: CoreThemeReference, progress?: ProgressTracker);
    get name(): string;
    getURL(): string;
}
/**
 * A resource that fetches a WordPress plugin from wordpress.org.
 */
export declare class CorePluginResource extends FetchResource {
    private resource;
    constructor(resource: CorePluginReference, progress?: ProgressTracker);
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    getURL(): string;
}
/**
 * Transforms a plugin slug into a directory zip name.
 * If the input already ends with ".zip", returns it unchanged.
 * Otherwise, appends ".latest-stable.zip".
 */
export declare function toDirectoryZipName(rawInput: string): string;
/**
 * A decorator for a resource that adds functionality such as progress tracking
 * and caching.
 */
export declare class DecoratedResource<T extends Resource> extends Resource {
    private resource;
    constructor(resource: T);
    /** @inheritDoc */
    resolve(): Promise<File>;
    /** @inheritDoc */
    setPlayground(playground: UniversalPHP): Promise<void>;
    /** @inheritDoc */
    get progress(): ProgressTracker | undefined;
    /** @inheritDoc */
    set progress(value: ProgressTracker | undefined);
    /** @inheritDoc */
    get name(): string;
    /** @inheritDoc */
    get isAsync(): boolean;
}
/**
 * A decorator for a resource that adds caching functionality.
 */
export declare class CachedResource<T extends Resource> extends DecoratedResource<T> {
    protected promise?: Promise<File>;
    /** @inheritDoc */
    resolve(): Promise<File>;
}
/**
 * A decorator for a resource that adds concurrency control functionality
 * through a semaphore.
 */
export declare class SemaphoreResource<T extends Resource> extends DecoratedResource<T> {
    private readonly semaphore;
    constructor(resource: T, semaphore: Semaphore);
    /** @inheritDoc */
    resolve(): Promise<File>;
}
