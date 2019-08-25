import { LoggerRequest, LoggerResponse, LoggerError } from './SharedTypes';

export type SerializedLoggerRequest = LoggerRequest & { body?: string };
export type SerializedLoggerResponse = LoggerResponse & { body?: string };

export interface SerializedLoggerEventWithError {
    request: LoggerRequest;
    response: null;
    error: LoggerError;
}

export interface SerializedLoggerEventWithResponse {
    request: LoggerRequest;
    response: LoggerResponse;
    error: null;
}

export type SerializedLoggerEvent =
    | SerializedLoggerEventWithResponse
    | SerializedLoggerEventWithError;
