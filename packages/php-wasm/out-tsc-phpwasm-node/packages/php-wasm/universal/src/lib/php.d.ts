import { PHPResponse } from './php-response';
import type { PHPRuntimeId } from './load-php-runtime';
import { MessageListener, PHPRequest, PHPRequestHeaders, PHPRunOptions, SpawnHandler, PHPEventListener, PHPEvent } from './universal-php';
import { RmDirOptions, ListFilesOptions } from './fs-helpers';
import { Semaphore } from '@php-wasm/util';
import { PHPRequestHandler } from './php-request-handler';
import { Emscripten } from './emscripten-types';
export declare const __private__dont__use: unique symbol;
export declare class PHPExecutionFailureError extends Error {
    response: PHPResponse;
    source: 'request' | 'php-wasm';
    constructor(message: string, response: PHPResponse, source: 'request' | 'php-wasm');
}
export type UnmountFunction = (() => Promise<any>) | (() => any);
export type MountHandler = (php: PHP, FS: Emscripten.RootFS, vfsMountPoint: string) => UnmountFunction | Promise<UnmountFunction>;
export declare const PHP_INI_PATH = "/internal/shared/php.ini";
/**
 * An environment-agnostic wrapper around the Emscripten PHP runtime
 * that universals the super low-level API and provides a more convenient
 * higher-level API.
 *
 * It exposes a minimal set of methods to run PHP scripts and to
 * interact with the PHP filesystem.
 */
export declare class PHP implements Disposable {
    #private;
    protected [__private__dont__use]: any;
    requestHandler?: PHPRequestHandler;
    /**
     * An exclusive lock that prevent multiple requests from running at
     * the same time.
     */
    semaphore: Semaphore;
    /**
     * Initializes a PHP runtime.
     *
     * @internal
     * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
     * @param  requestHandlerOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
     */
    constructor(PHPRuntimeId?: PHPRuntimeId);
    /**
     * Adds an event listener for a PHP event.
     * @param eventType - The type of event to listen for.
     * @param listener - The listener function to be called when the event is triggered.
     */
    addEventListener(eventType: PHPEvent['type'], listener: PHPEventListener): void;
    /**
     * Removes an event listener for a PHP event.
     * @param eventType - The type of event to remove the listener from.
     * @param listener - The listener function to be removed.
     */
    removeEventListener(eventType: PHPEvent['type'], listener: PHPEventListener): void;
    dispatchEvent<Event extends PHPEvent>(event: Event): void;
    /**
     * Listens to message sent by the PHP code.
     *
     * To dispatch messages, call:
     *
     *     post_message_to_js(string $data)
     *
     *     Arguments:
     *         $data (string) – Data to pass to JavaScript.
     *
     * @example
     *
     * ```ts
     * const php = await PHP.load('8.0');
     *
     * php.onMessage(
     *     // The data is always passed as a string
     *     function (data: string) {
     *         // Let's decode and log the data:
     *         console.log(JSON.parse(data));
     *     }
     * );
     *
     * // Now that we have a listener in place, let's
     * // dispatch a message:
     * await php.run({
     *     code: `<?php
     *         post_message_to_js(
     *             json_encode([
     *                 'post_id' => '15',
     *                 'post_title' => 'This is a blog post!'
     *             ])
     *         ));
     *     `,
     * });
     * ```
     *
     * @param listener Callback function to handle the message.
     */
    onMessage(listener: MessageListener): void;
    setSpawnHandler(handler: SpawnHandler | string): Promise<void>;
    /** @deprecated Use PHPRequestHandler instead. */
    get absoluteUrl(): string;
    /** @deprecated Use PHPRequestHandler instead. */
    get documentRoot(): string;
    /** @deprecated Use PHPRequestHandler instead. */
    pathToInternalUrl(path: string): string;
    /** @deprecated Use PHPRequestHandler instead. */
    internalUrlToPath(internalUrl: string): string;
    initializeRuntime(runtimeId: PHPRuntimeId): void;
    /** @inheritDoc */
    setSapiName(newName: string): Promise<void>;
    /**
     * Changes the current working directory in the PHP filesystem.
     * This is the directory that will be used as the base for relative paths.
     * For example, if the current working directory is `/root/php`, and the
     * path is `data`, the absolute path will be `/root/php/data`.
     *
     * @param  path - The new working directory.
     */
    chdir(path: string): void;
    /**
     * Do not use. Use new PHPRequestHandler() instead.
     * @deprecated
     */
    request(request: PHPRequest): Promise<PHPResponse>;
    /**
     * Runs PHP code.
     *
     * This low-level method directly interacts with the WebAssembly
     * PHP interpreter.
     *
     * Every time you call run(), it prepares the PHP
     * environment and:
     *
     * * Resets the internal PHP state
     * * Populates superglobals ($_SERVER, $_GET, etc.)
     * * Handles file uploads
     * * Populates input streams (stdin, argv, etc.)
     * * Sets the current working directory
     *
     * You can use run() in two primary modes:
     *
     * ### Code snippet mode
     *
     * In this mode, you pass a string containing PHP code to run.
     *
     * ```ts
     * const result = await php.run({
     * 	code: `<?php echo "Hello world!";`
     * });
     * // result.text === "Hello world!"
     * ```
     *
     * In this mode, information like __DIR__ or __FILE__ isn't very
     * useful because the code is not associated with any file.
     *
     * Under the hood, the PHP snippet is passed to the `zend_eval_string`
     * C function.
     *
     * ### File mode
     *
     * In the file mode, you pass a scriptPath and PHP executes a file
     * found at a that path:
     *
     * ```ts
     * php.writeFile(
     * 	"/www/index.php",
     * 	`<?php echo "Hello world!";"`
     * );
     * const result = await php.run({
     * 	scriptPath: "/www/index.php"
     * });
     * // result.text === "Hello world!"
     * ```
     *
     * In this mode, you can rely on path-related information like __DIR__
     * or __FILE__.
     *
     * Under the hood, the PHP file is executed with the `php_execute_script`
     * C function.
     *
     * The `run()` method cannot be used in conjunction with `cli()`.
     *
     * @example
     * ```js
     * const result = await php.run(`<?php
     *  $fp = fopen('php://stderr', 'w');
     *  fwrite($fp, "Hello, world!");
     * `);
     * // result.errors === "Hello, world!"
     * ```
     *
     * @param  options - PHP runtime options.
     */
    run(request: PHPRunOptions): Promise<PHPResponse>;
    /**
     * Defines a constant in the PHP runtime.
     * @param key - The name of the constant.
     * @param value - The value of the constant.
     */
    defineConstant(key: string, value: string | boolean | number | null): void;
    /**
     * Recursively creates a directory with the given path in the PHP filesystem.
     * For example, if the path is `/root/php/data`, and `/root` already exists,
     * it will create the directories `/root/php` and `/root/php/data`.
     *
     * @param  path - The directory path to create.
     */
    mkdir(path: string): void;
    /**
     * @deprecated Use mkdir instead.
     */
    mkdirTree(path: string): void;
    /**
     * Reads a file from the PHP filesystem and returns it as a string.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param  path - The file path to read.
     * @returns The file contents.
     */
    readFileAsText(path: string): string;
    /**
     * Reads a file from the PHP filesystem and returns it as an array buffer.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param  path - The file path to read.
     * @returns The file contents.
     */
    readFileAsBuffer(path: string): Uint8Array;
    /**
     * Overwrites data in a file in the PHP filesystem.
     * Creates a new file if one doesn't exist yet.
     *
     * @param  path - The file path to write to.
     * @param  data - The data to write to the file.
     */
    writeFile(path: string, data: string | Uint8Array): void;
    /**
     * Removes a file from the PHP filesystem.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param  path - The file path to remove.
     */
    unlink(path: string): void;
    /**
     * Moves a file or directory in the PHP filesystem to a
     * new location.
     *
     * @param oldPath The path to rename.
     * @param newPath The new path.
     */
    mv(fromPath: string, toPath: string): void;
    /**
     * Removes a directory from the PHP filesystem.
     *
     * @param path The directory path to remove.
     * @param options Options for the removal.
     */
    rmdir(path: string, options?: RmDirOptions): void;
    /**
     * Lists the files and directories in the given directory.
     *
     * @param  path - The directory path to list.
     * @param  options - Options for the listing.
     * @returns The list of files and directories in the given directory.
     */
    listFiles(path: string, options?: ListFilesOptions): string[];
    /**
     * Checks if a directory exists in the PHP filesystem.
     *
     * @param  path – The path to check.
     * @returns True if the path is a directory, false otherwise.
     */
    isDir(path: string): boolean;
    /**
     * Checks if a file exists in the PHP filesystem.
     *
     * @param  path – The path to check.
     * @returns True if the path is a file, false otherwise.
     */
    isFile(path: string): boolean;
    /**
     * Creates a symlink in the PHP filesystem.
     * @param target
     * @param path
     */
    symlink(target: string, path: string): any;
    /**
     * Checks if a path is a symlink in the PHP filesystem.
     *
     * @param path
     * @returns True if the path is a symlink, false otherwise.
     */
    isSymlink(path: string): boolean;
    /**
     * Reads the target of a symlink in the PHP filesystem.
     *
     * @param path
     * @returns The target of the symlink.
     */
    readlink(path: string): string;
    /**
     * Resolves the real path of a file in the PHP filesystem.
     * @param path
     * @returns The real path of the file.
     */
    realpath(path: string): string;
    /**
     * Checks if a file (or a directory) exists in the PHP filesystem.
     *
     * @param  path - The file path to check.
     * @returns True if the file exists, false otherwise.
     */
    fileExists(path: string): boolean;
    /**
     * Hot-swaps the PHP runtime for a new one without
     * interrupting the operations of this PHP instance.
     *
     * @param runtime
     * @param cwd. Internal, the VFS path to recreate in the new runtime.
     *             This arg is temporary and will be removed once BasePHP
     *             is fully decoupled from the request handler and
     *             accepts a constructor-level cwd argument.
     */
    hotSwapPHPRuntime(runtime: number, cwd?: string): void;
    /**
     * Mounts a filesystem to a given path in the PHP filesystem.
     *
     * @param  virtualFSPath - Where to mount it in the PHP virtual filesystem.
     * @param  mountHandler - The mount handler to use.
     * @return Unmount function to unmount the filesystem.
     */
    mount(virtualFSPath: string, mountHandler: MountHandler): Promise<UnmountFunction>;
    /**
     * Starts a PHP CLI session with given arguments.
     *
     * This method can only be used when PHP was compiled with the CLI SAPI
     * and it cannot be used in conjunction with `run()`.
     *
     * Once this method finishes running, the PHP instance is no
     * longer usable and should be discarded. This is because PHP
     * internally cleans up all the resources and calls exit().
     *
     * @param  argv - The arguments to pass to the CLI.
     * @returns The exit code of the CLI session.
     */
    cli(argv: string[]): Promise<number>;
    setSkipShebang(shouldSkip: boolean): void;
    exit(code?: number): void;
    [Symbol.dispose](): void;
}
export declare function normalizeHeaders(headers: PHPRequestHeaders): PHPRequestHeaders;
