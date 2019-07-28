import { LoggerOnResponseCallback } from './SharedTypes';
export default class GlobalHttpLogger {
    onRequestEnd: LoggerOnResponseCallback;
    constructor({ onRequestEnd }: {
        onRequestEnd: LoggerOnResponseCallback;
    });
    start(): void;
    stop(): void;
}
