/// <reference lib="webworker" />
/**
 * Run this function in the service worker to install the required event
 * handlers.
 *
 * @param  config
 */
export declare function initializeServiceWorker(config: ServiceWorkerConfiguration): void;
export declare function convertFetchEventToPHPRequest(event: FetchEvent): Promise<Response>;
/**
 * Sends the message to all the controlled clients
 * of this service worker.
 *
 * This used to be implemented with a BroadcastChannel, but
 * it didn't work in Safari. BroadcastChannel breaks iframe
 * embedding the playground in Safari.
 *
 * Weirdly, Safari does not pass any messages from the ServiceWorker
 * to Window if the page is rendered inside an iframe. Window to Service
 * Worker communication works just fine.
 *
 * The regular client.postMessage() communication works perfectly, so that's
 * what this function uses to broadcast the message.
 *
 * @param  message The message to broadcast.
 * @param  scope   Target web worker scope.
 * @returns The request ID to receive the reply.
 */
export declare function broadcastMessageExpectReply(message: any, scope: string): Promise<number>;
interface ServiceWorkerConfiguration {
    handleRequest?: (event: FetchEvent) => Promise<Response> | undefined;
}
/**
 * Copy a request with custom overrides.
 *
 * This function is only needed because Request properties
 * are read-only. The only way to change e.g. a URL is to
 * create an entirely new request:
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Request
 *
 * @param  request
 * @param  overrides
 * @returns The new request.
 */
export declare function cloneRequest(request: Request, overrides: Record<string, any>): Promise<Request>;
/**
 * Extracts headers from a Request as a plain key->value JS object.
 *
 * @param request
 * @returns
 */
export declare function getRequestHeaders(request: Request): Record<string, string>;
export {};
