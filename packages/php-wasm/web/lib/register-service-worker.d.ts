import { PHPWorker } from '@php-wasm/universal';
import { Remote } from 'comlink';
export interface Client extends Remote<PHPWorker> {
}
export declare const phpApiPromise: Promise<Client>;
/**
 * Sets the PHP API client.
 *
 * @param {Client} api The PHP API client.
 *
 */
export declare function setPhpInstanceUsedByServiceWorker(api: Client): void;
/**
 * Run this in the main application to register the service worker or
 * reload the registered worker if the app expects a different version
 * than the currently registered one.
 *
 * @param scope       The numeric value used in the path prefix of the site
 *                    this service worker is meant to serve. E.g. for a prefix
 *                    like `/scope:793/`, the scope would be `793`. See the
 *                    `@php-wasm/scopes` package for more details.
 * @param scriptUrl   The URL of the service worker script.
 */
export declare function registerServiceWorker(scope: string, scriptUrl: string): Promise<void>;
