import { EmscriptenDownloadMonitor } from '@php-wasm/progress';
import { PHP } from './php';
import { PHPRequestHandler } from './php-request-handler';
import { PHPResponse } from './php-response';
import { PHPRequest, PHPRunOptions, MessageListener, PHPEvent, PHPEventListener } from './universal-php';
import { RmDirOptions, ListFilesOptions } from './fs-helpers';
export type LimitedPHPApi = Pick<PHP, 'request' | 'defineConstant' | 'addEventListener' | 'removeEventListener' | 'mkdir' | 'mkdirTree' | 'readFileAsText' | 'readFileAsBuffer' | 'writeFile' | 'unlink' | 'mv' | 'rmdir' | 'listFiles' | 'isDir' | 'fileExists' | 'chdir' | 'run' | 'onMessage'> & {
    documentRoot: PHP['documentRoot'];
    absoluteUrl: PHP['absoluteUrl'];
};
/**
 * A PHP client that can be used to run PHP code in the browser.
 */
export declare class PHPWorker implements LimitedPHPApi {
    /** @inheritDoc @php-wasm/universal!RequestHandler.absoluteUrl  */
    absoluteUrl: string;
    /** @inheritDoc @php-wasm/universal!RequestHandler.documentRoot  */
    documentRoot: string;
    /** @inheritDoc */
    constructor(requestHandler?: PHPRequestHandler, monitor?: EmscriptenDownloadMonitor);
    __internal_setRequestHandler(requestHandler: PHPRequestHandler): void;
    /**
     * @internal
     * @deprecated
     * Do not use this method directly in the code consuming
     * the web API. It will change or even be removed without
     * a warning.
     */
    protected __internal_getPHP(): PHP | undefined;
    setPrimaryPHP(php: PHP): Promise<void>;
    /** @inheritDoc @php-wasm/universal!PHPRequestHandler.pathToInternalUrl  */
    pathToInternalUrl(path: string): string;
    /** @inheritDoc @php-wasm/universal!PHPRequestHandler.internalUrlToPath  */
    internalUrlToPath(internalUrl: string): string;
    /**
     * The onDownloadProgress event listener.
     */
    onDownloadProgress(callback: (progress: CustomEvent<ProgressEvent>) => void): Promise<void>;
    /** @inheritDoc @php-wasm/universal!PHP.mv  */
    mv(fromPath: string, toPath: string): Promise<void>;
    /** @inheritDoc @php-wasm/universal!PHP.rmdir  */
    rmdir(path: string, options?: RmDirOptions): Promise<void>;
    /** @inheritDoc @php-wasm/universal!PHPRequestHandler.request */
    request(request: PHPRequest): Promise<PHPResponse>;
    /** @inheritDoc @php-wasm/universal!/PHP.run */
    run(request: PHPRunOptions): Promise<PHPResponse>;
    /** @inheritDoc @php-wasm/universal!/PHP.chdir */
    chdir(path: string): void;
    /** @inheritDoc @php-wasm/universal!/PHP.setSapiName */
    setSapiName(newName: string): void;
    /** @inheritDoc @php-wasm/universal!/PHP.mkdir */
    mkdir(path: string): void;
    /** @inheritDoc @php-wasm/universal!/PHP.mkdirTree */
    mkdirTree(path: string): void;
    /** @inheritDoc @php-wasm/universal!/PHP.readFileAsText */
    readFileAsText(path: string): string;
    /** @inheritDoc @php-wasm/universal!/PHP.readFileAsBuffer */
    readFileAsBuffer(path: string): Uint8Array;
    /** @inheritDoc @php-wasm/universal!/PHP.writeFile */
    writeFile(path: string, data: string | Uint8Array): void;
    /** @inheritDoc @php-wasm/universal!/PHP.unlink */
    unlink(path: string): void;
    /** @inheritDoc @php-wasm/universal!/PHP.listFiles */
    listFiles(path: string, options?: ListFilesOptions): string[];
    /** @inheritDoc @php-wasm/universal!/PHP.isDir */
    isDir(path: string): boolean;
    /** @inheritDoc @php-wasm/universal!/PHP.isFile */
    isFile(path: string): boolean;
    /** @inheritDoc @php-wasm/universal!/PHP.fileExists */
    fileExists(path: string): boolean;
    /** @inheritDoc @php-wasm/universal!/PHP.onMessage */
    onMessage(listener: MessageListener): void;
    /** @inheritDoc @php-wasm/universal!/PHP.defineConstant */
    defineConstant(key: string, value: string | boolean | number | null): void;
    /** @inheritDoc @php-wasm/universal!/PHP.addEventListener */
    addEventListener(eventType: PHPEvent['type'], listener: PHPEventListener): void;
    /** @inheritDoc @php-wasm/universal!/PHP.removeEventListener */
    removeEventListener(eventType: PHPEvent['type'], listener: PHPEventListener): void;
}
