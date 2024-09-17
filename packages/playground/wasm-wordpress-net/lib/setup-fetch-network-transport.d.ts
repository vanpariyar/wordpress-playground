import { UniversalPHP } from '@php-wasm/universal';
export interface RequestData {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    data?: string;
}
export interface RequestMessage {
    type: 'request';
    data: RequestData;
}
/**
 * Allow WordPress to make network requests via the fetch API.
 * On the WordPress side, this is handled by Requests_Transport_Fetch
 *
 * @param playground the Playground instance to set up with network support.
 */
export declare function setupFetchNetworkTransport(playground: UniversalPHP): Promise<void>;
export declare function handleRequest(data: RequestData, fetchFn?: typeof fetch): Promise<Uint8Array>;
