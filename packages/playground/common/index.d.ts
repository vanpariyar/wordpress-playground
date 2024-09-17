/**
 * Avoid adding new code here. @wp-playground/common should remain
 * as lean as possible.
 *
 * This package exists to avoid circular dependencies. Let's not
 * use it as a default place to add code that doesn't seem to fit
 * anywhere else. If there's no good place for your code, perhaps
 * it needs to be restructured? Or maybe there's a need for a new package?
 * Let's always consider these questions before adding new code here.
 */
import { UniversalPHP } from '@php-wasm/universal';
export declare const RecommendedPHPVersion = "8.0";
export declare const unzipFile: (php: UniversalPHP, zipPath: string | File, extractToPath: string, overwriteFiles?: boolean) => Promise<void>;
export declare const zipDirectory: (php: UniversalPHP, directoryPath: string) => Promise<Uint8Array>;
