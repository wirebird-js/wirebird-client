export type Timestamp = number;
export type Uid = string;

export interface LoggerHeaders {
    [headerName: string]: string | number | string[] | undefined;
}

export type LoggerResponseRawHeaders = string[];

export interface BaseLoggerRequest<T> {
    id: Uid;
    timeStart: Timestamp;
    url: string;
    body: T | null;
    headers: LoggerHeaders;
    method: string;
    remoteAddress: string | null;
}

export interface BaseLoggerResponse<T> {
    timeStart: Timestamp;
    body: T | null;
    headers: LoggerHeaders;
    rawHeaders: LoggerResponseRawHeaders;
    status: number;
}

export type LoggerRequest = BaseLoggerRequest<Buffer>;
export type LoggerResponse = BaseLoggerResponse<Buffer>;

export interface LoggerError {
    code: string;
    message: string;
    stack: string;
}

export interface LoggerEventWithError {
    request: LoggerRequest;
    response: null;
    error: LoggerError;
}

export interface LoggerEventWithResponse {
    request: LoggerRequest;
    response: LoggerResponse;
    error: null;
}

export interface ProcessData {
    pid: number;
    title: string;
    mainModule: string;
}
export interface MonitorMetadata {
    processData: ProcessData;
}

export type LoggerEvent = LoggerEventWithResponse | LoggerEventWithError;
export type MonitorEvent = LoggerEvent & MonitorMetadata;

export type LoggerEventHandler = (payload: LoggerEvent) => void;
export type LoggerShouldLog = (req: LoggerRequest) => boolean;
