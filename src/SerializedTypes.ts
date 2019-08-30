import {
    LoggerError,
    BaseLoggerRequest,
    BaseLoggerResponse
} from './SharedTypes';

export type SerializedLoggerRequest = BaseLoggerRequest<string>;
export type SerializedLoggerResponse = BaseLoggerResponse<string>;

export interface SerializedLoggerEventWithError {
    request: SerializedLoggerRequest;
    response: null;
    error: LoggerError;
}

export interface SerializedLoggerEventWithResponse {
    request: SerializedLoggerRequest;
    response: SerializedLoggerResponse;
    error: null;
}

export type SerializedLoggerEvent =
    | SerializedLoggerEventWithResponse
    | SerializedLoggerEventWithError;
