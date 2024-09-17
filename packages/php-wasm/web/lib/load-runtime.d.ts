import { EmscriptenOptions, PHPLoaderModule, SupportedPHPVersion } from '@php-wasm/universal';
export interface LoaderOptions {
    emscriptenOptions?: EmscriptenOptions;
    onPhpLoaderModuleLoaded?: (module: PHPLoaderModule) => void;
    /** @deprecated To be replaced with `extensions` in the future */
    loadAllExtensions?: boolean;
}
export declare function loadWebRuntime(phpVersion: SupportedPHPVersion, options?: LoaderOptions): Promise<number>;
