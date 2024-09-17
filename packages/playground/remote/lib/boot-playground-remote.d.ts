import type { PlaygroundWorkerEndpoint, WorkerBootOptions, MountDescriptor } from './worker-thread';
export type { MountDescriptor, WorkerBootOptions };
import type { WebClientMixin } from './playground-client';
export declare const workerUrl: string;
export declare const serviceWorkerUrl: URL;
export declare function bootPlaygroundRemote(): Promise<import("@php-wasm/web").PublicAPI<WebClientMixin, import("@php-wasm/web").RemoteAPI<PlaygroundWorkerEndpoint>>>;
