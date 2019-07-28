export interface LoggerHeaders {
    [headerName: string]: string;
}

export interface LoggerRequest {
    url: string;
    body: Buffer | null;
    headers: LoggerHeaders;
    method: string;
}

export interface LoggerResponse {
    body: Buffer | null;
    headers: LoggerHeaders;
    status: number;
}

export interface LoggerError {
    code: string;
    message: string;
    stack: string;
}

export interface LoggerOnResponseError {
    request: LoggerRequest;
    response: null;
    error: LoggerError;
}

export interface LoggerOnResponseResponse {
    request: LoggerRequest;
    response: LoggerResponse;
    error: null;
}

export type LoggerOnResponsePayload =
    | LoggerOnResponseResponse
    | LoggerOnResponseError;

export type LoggerOnResponseCallback = (
    payload: LoggerOnResponsePayload
) => void;
