import { PHPLoaderModule, SupportedPHPVersion } from '@php-wasm/universal';
/**
 * Loads the PHP loader module for the given PHP version.
 *
 * @param version The PHP version to load.
 * @param variant Internal. Do not use.
 * @returns The PHP loader module.
 */
export declare function getPHPLoaderModule(version?: SupportedPHPVersion, variant?: 'light' | 'kitchen-sink'): Promise<PHPLoaderModule>;
