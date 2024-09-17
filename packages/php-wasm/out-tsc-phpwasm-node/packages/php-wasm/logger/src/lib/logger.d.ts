export { logEventType } from './handlers/log-event';
export { errorLogPath } from './collectors/collect-php-logs';
export type Log = {
    message: any;
    severity?: LogSeverity;
    prefix?: LogPrefix;
    raw?: boolean;
};
/**
 * Log severity levels.
 */
export type LogSeverity = 'Debug' | 'Info' | 'Warn' | 'Error' | 'Fatal';
/**
 * Log prefix.
 */
export type LogPrefix = 'WASM Crash' | 'PHP' | 'JavaScript';
/**
 * A logger for Playground.
 */
export declare class Logger extends EventTarget {
    private readonly handlers;
    readonly fatalErrorEvent = "playground-fatal-error";
    constructor(handlers?: Function[]);
    /**
     * Get all logs.
     * @returns string[]
     */
    getLogs(): string[];
    /**
     * Log message with severity.
     *
     * @param message any
     * @param severity LogSeverity
     * @param raw boolean
     * @param args any
     */
    logMessage(log: Log, ...args: any[]): void;
    /**
     * Log message
     *
     * @param message any
     * @param args any
     */
    log(message: any, ...args: any[]): void;
    /**
     * Log debug message
     *
     * @param message any
     * @param args any
     */
    debug(message: any, ...args: any[]): void;
    /**
     * Log info message
     *
     * @param message any
     * @param args any
     */
    info(message: any, ...args: any[]): void;
    /**
     * Log warning message
     *
     * @param message any
     * @param args any
     */
    warn(message: any, ...args: any[]): void;
    /**
     * Log error message
     *
     * @param message any
     * @param args any
     */
    error(message: any, ...args: any[]): void;
}
/**
 * The logger instance.
 */
export declare const logger: Logger;
export declare const prepareLogMessage: (message: string) => string;
export declare const formatLogEntry: (message: string, severity: LogSeverity, prefix: string) => string;
/**
 * Add a listener for the Playground crashes.
 * These crashes include Playground errors like Asyncify errors.
 * The callback function will receive an Event object with logs in the detail
 * property.
 *
 * @param loggerInstance The logger instance
 * @param callback The callback function
 */
export declare const addCrashListener: (loggerInstance: Logger, callback: EventListenerOrEventListenerObject) => void;
