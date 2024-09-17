import type { PHPRequestHandler } from '@php-wasm/universal';
export declare function getLoadedWordPressVersion(requestHandler: PHPRequestHandler): Promise<string>;
export declare function versionStringToLoadedWordPressVersion(wpVersionString: string): string;
