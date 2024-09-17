import { MountDevice, SyncProgressCallback } from '@php-wasm/web';
import { EmscriptenDownloadMonitor } from '@php-wasm/progress';
import { FilesystemOperation } from '@php-wasm/fs-journal';
import { PHPWorker, SupportedPHPVersion } from '@php-wasm/universal';
export interface MountDescriptor {
    mountpoint: string;
    device: MountDevice;
    initialSyncDirection: 'opfs-to-memfs' | 'memfs-to-opfs';
}
export type WorkerBootOptions = {
    wpVersion?: string;
    phpVersion?: SupportedPHPVersion;
    sapiName?: string;
    phpExtensions?: string[];
    scope: string;
    withNetworking: boolean;
    mounts?: Array<MountDescriptor>;
    shouldInstallWordPress?: boolean;
};
/** @inheritDoc PHPClient */
export declare class PlaygroundWorkerEndpoint extends PHPWorker {
    booted: boolean;
    /**
     * A string representing the scope of the Playground instance.
     */
    scope: string | undefined;
    /**
     * A string representing the requested version of WordPress.
     */
    requestedWordPressVersion: string | undefined;
    /**
     * A string representing the version of WordPress that was loaded.
     */
    loadedWordPressVersion: string | undefined;
    unmounts: Record<string, () => any>;
    constructor(monitor: EmscriptenDownloadMonitor);
    /**
     * @returns WordPress module details, including the static assets directory and default theme.
     */
    getWordPressModuleDetails(): Promise<{
        majorVersion: string | undefined;
        staticAssetsDirectory: string | undefined;
    }>;
    getMinifiedWordPressVersions(): Promise<{
        all: {
            nightly: string;
            beta: string;
            "6.6": string;
            "6.5": string;
            "6.4": string;
            "6.3": string;
        };
        latest: string;
    }>;
    hasOpfsMount(mountpoint: string): Promise<boolean>;
    mountOpfs(options: MountDescriptor, onProgress?: SyncProgressCallback): Promise<void>;
    unmountOpfs(mountpoint: string): Promise<void>;
    backfillStaticFilesRemovedFromMinifiedBuild(): Promise<void>;
    hasCachedStaticFilesRemovedFromMinifiedBuild(): Promise<boolean>;
    boot({ scope, mounts, wpVersion, phpVersion, phpExtensions, sapiName, shouldInstallWordPress, }: WorkerBootOptions): Promise<void>;
    journalFSEvents(root: string, callback: (op: FilesystemOperation) => void): Promise<() => any>;
    replayFSJournal(events: FilesystemOperation[]): Promise<void>;
}
