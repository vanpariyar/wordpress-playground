import { Emscripten } from './emscripten-types';
export interface RmDirOptions {
    /**
     * If true, recursively removes the directory and all its contents.
     * Default: true.
     */
    recursive?: boolean;
}
export interface ListFilesOptions {
    /**
     * If true, prepend given folder path to all file names.
     * Default: false.
     */
    prependPath: boolean;
}
export declare class FSHelpers {
    /**
     * Reads a file from the PHP filesystem and returns it as a string.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param FS
     * @param  path - The file path to read.
     * @returns The file contents.
     */
    static readFileAsText(FS: Emscripten.RootFS, path: string): string;
    /**
     * Reads a file from the PHP filesystem and returns it as an array buffer.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param FS
     * @param  path - The file path to read.
     * @returns The file contents.
     */
    static readFileAsBuffer(FS: Emscripten.RootFS, path: string): Uint8Array;
    /**
     * Overwrites data in a file in the PHP filesystem.
     * Creates a new file if one doesn't exist yet.
     *
     * @param FS
     * @param  path - The file path to write to.
     * @param  data - The data to write to the file.
     */
    static writeFile(FS: Emscripten.RootFS, path: string, data: string | Uint8Array): void;
    /**
     * Removes a file from the PHP filesystem.
     *
     * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
     * @param FS
     * @param  path - The file path to remove.
     */
    static unlink(FS: Emscripten.RootFS, path: string): void;
    /**
     * Moves a file or directory in the PHP filesystem to a
     * new location.
     *
     * @param FS
     * @param fromPath The path to rename.
     * @param toPath The new path.
     */
    static mv(FS: Emscripten.RootFS, fromPath: string, toPath: string): void;
    /**
     * Removes a directory from the PHP filesystem.
     *
     * @param FS
     * @param path The directory path to remove.
     * @param options Options for the removal.
     */
    static rmdir(FS: Emscripten.RootFS, path: string, options?: RmDirOptions): void;
    /**
     * Lists the files and directories in the given directory.
     *
     * @param FS
     * @param  path - The directory path to list.
     * @param  options - Options for the listing.
     * @returns The list of files and directories in the given directory.
     */
    static listFiles(FS: Emscripten.RootFS, path: string, options?: ListFilesOptions): string[];
    /**
     * Checks if a directory exists in the PHP filesystem.
     *
     * @param FS
     * @param  path – The path to check.
     * @returns True if the path is a directory, false otherwise.
     */
    static isDir(FS: Emscripten.RootFS, path: string): boolean;
    /**
     * Checks if a file exists in the PHP filesystem.
     *
     * @param FS
     * @param  path – The path to check.
     * @returns True if the path is a file, false otherwise.
     */
    static isFile(FS: Emscripten.RootFS, path: string): boolean;
    /**
     * Creates a symlink in the PHP filesystem.
     *
     * @param FS
     * @param target
     * @param link
     */
    static symlink(FS: Emscripten.RootFS, target: string, link: string): any;
    /**
     * Checks if a path is a symlink in the PHP filesystem.
     *
     * @param FS
     * @param path
     * @returns True if the path is a symlink, false otherwise.
     */
    static isSymlink(FS: Emscripten.RootFS, path: string): boolean;
    /**
     * Reads the target of a symlink in the PHP filesystem.
     * @param FS
     * @param path
     * @returns The target of the symlink.
     * @throws {@link @php-wasm/universal:ErrnoError} – If the path is not a symlink.
     */
    static readlink(FS: Emscripten.RootFS, path: string): string;
    /**
     * Gets the real path of a file in the PHP filesystem.
     * @param FS
     * @param path
     *
     * @returns The real path of the file.
     */
    static realpath(FS: Emscripten.RootFS, path: string): string;
    /**
     * Checks if a file (or a directory) exists in the PHP filesystem.
     *
     * @param FS
     * @param  path - The file path to check.
     * @returns True if the file exists, false otherwise.
     */
    static fileExists(FS: Emscripten.RootFS, path: string): boolean;
    /**
     * Recursively creates a directory with the given path in the PHP filesystem.
     * For example, if the path is `/root/php/data`, and `/root` already exists,
     * it will create the directories `/root/php` and `/root/php/data`.
     *
     * @param FS
     * @param  path - The directory path to create.
     */
    static mkdir(FS: Emscripten.RootFS, path: string): void;
    static copyRecursive(FS: Emscripten.FileSystemInstance, fromPath: string, toPath: string): void;
}
