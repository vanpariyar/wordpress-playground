import * as http from 'http';
/**
 * Send a chunk of data to the remote server.
 */
export declare const COMMAND_CHUNK = 1;
/**
 * Set a TCP socket option.
 */
export declare const COMMAND_SET_SOCKETOPT = 2;
/**
 * Adds support for TCP socket options to WebSocket class.
 *
 * Socket options are implemented by adopting a specific data transmission
 * protocol between WS client and WS server The first byte
 * of every message is a command type, and the remaining bytes
 * are the actual data.
 *
 * @param  WebSocketConstructor
 * @returns Decorated constructor
 */
export declare function addSocketOptionsSupportToWebSocketClass(WebSocketConstructor: typeof WebSocket): {
    new (url: string | URL, protocols?: string | string[]): {
        send(chunk: any, callback: any): any;
        setSocketOpt(optionClass: number, optionName: number, optionValue: number): any;
        sendCommand(commandType: number, chunk: string | ArrayBuffer | ArrayLike<number>, callback: any): any;
        binaryType: BinaryType;
        readonly bufferedAmount: number;
        readonly extensions: string;
        onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
        onerror: ((this: WebSocket, ev: Event) => any) | null;
        onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
        onopen: ((this: WebSocket, ev: Event) => any) | null;
        readonly protocol: string;
        readonly readyState: number;
        readonly url: string;
        close(code?: number, reason?: string): void;
        close(code?: number, reason?: string): void;
        readonly CONNECTING: 0;
        readonly OPEN: 1;
        readonly CLOSING: 2;
        readonly CLOSED: 3;
        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        dispatchEvent(event: Event): boolean;
        dispatchEvent(event: Event): boolean;
    };
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
};
export declare function initOutboundWebsocketProxyServer(listenPort: number, listenHost?: string): Promise<http.Server>;
