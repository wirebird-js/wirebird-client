// https://github.com/Microsoft/TypeScript-Babel-Starter

import http, { ClientRequest, IncomingMessage } from 'http';
import https from 'https';
import {
    LoggerEvent,
    LoggerHeaders,
    LoggerRequest,
    LoggerResponse,
    LoggerEventHandler,
    LoggerShouldLog,
    Timestamp,
} from './SharedTypes';
import { createUnzip, Unzip } from 'zlib';
import nanoid from 'nanoid';

const matches = process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
const nodeMajorVersion = matches ? +matches[1] : 0;

interface ClientRequestWithUndocumentedMembers extends ClientRequest {
    agent: any;
    method: string;
    _headers: { [headerName: string]: string };
}

class ResponseBodyCollector {
    buffers: Array<Buffer>;

    bodyPromise: Promise<Buffer>;

    private shouldUnzip(response: IncomingMessage): boolean {
        const encoding = response.headers['content-encoding'];
        const status = response.statusCode;
        return (
            !!encoding &&
            ['gzip', 'deflate', 'compress'].includes(encoding) &&
            status !== 204
        );
    }

    private unzip(response: IncomingMessage): Unzip {
        const stream = response.pipe(createUnzip());
        return stream;
    }

    constructor(response: IncomingMessage) {
        this.buffers = [];

        const stream = this.shouldUnzip(response)
            ? this.unzip(response)
            : response;

        this.bodyPromise = new Promise((resolve) => {
            stream.on('data', (chunk) => {
                this.buffers.push(chunk);
            });
            stream.on('end', () => {
                const body = Buffer.concat(this.buffers);
                resolve(body);
            });
        });
    }

    getBodyAsync(): Promise<Buffer> {
        return this.bodyPromise;
    }
}

const waitForResponseOrError = (
    request: ClientRequest
): Promise<{
    response?: IncomingMessage;
    responseBodyCollector?: ResponseBodyCollector;
    responseTimeStart?: Timestamp;
    error?: Error;
}> =>
    new Promise((resolve) => {
        request.prependOnceListener('response', (response) => {
            const responseTimeStart = Date.now();
            const responseBodyCollector = new ResponseBodyCollector(response);
            resolve({ response, responseBodyCollector, responseTimeStart });
        });
        request.prependOnceListener('error', (error) => {
            resolve({ error });
        });
    });

const collectRequestBody = (request: ClientRequest): Promise<Buffer | null> =>
    new Promise((resolve) => {
        const requestBody: Array<Buffer> = [];

        const reqWrite = request.write;
        request.write = function (...args: any) {
            /**
             * chunk can be either a string or a Buffer.
             */
            const chunk = args[0];

            if (Buffer.isBuffer(chunk)) {
                requestBody.push(chunk);
            } else {
                requestBody.push(Buffer.from(chunk, 'utf8'));
            }

            return reqWrite.apply(this, args);
        };

        const reqEnd = request.end;
        request.end = function (...args: any) {
            /**
             * the first argument might be a callback or a chunk
             */
            const maybeChunk = args[0];

            if (Buffer.isBuffer(maybeChunk)) {
                requestBody.push(maybeChunk);
            } else if (maybeChunk && typeof maybeChunk !== 'function') {
                requestBody.push(Buffer.from(maybeChunk, 'utf8'));
            }

            return reqEnd.apply(this, args);
        };

        request.prependOnceListener('finish', () => {
            if (!requestBody.length) {
                resolve(null);
            } else {
                resolve(Buffer.concat(requestBody));
            }
        });

        request.prependOnceListener('error', () => resolve(null));
    });

const interceptRequest = async (
    request: ClientRequest,
    onRequestEnd: (payload: LoggerEvent) => void,
    shouldLog?: LoggerShouldLog
) => {
    const protocol = (request as ClientRequestWithUndocumentedMembers).agent
        .protocol;
    const host = request.getHeader('host');
    const path = request.path;

    const loggerRequest: LoggerRequest = {
        id: nanoid(),
        timeStart: Date.now(),
        url: `${protocol}//${host}${path}`,
        method: (request as ClientRequestWithUndocumentedMembers).method,
        headers: (request as ClientRequestWithUndocumentedMembers)._headers,
        body: null,
    };

    if (shouldLog && !shouldLog(loggerRequest)) {
        return;
    }

    const [
        requestBody,
        { response, responseBody, responseTimeStart, error },
    ] = await Promise.all([
        collectRequestBody(request),
        (async () => {
            const {
                response,
                responseBodyCollector,
                responseTimeStart,
                error,
            } = await waitForResponseOrError(request);
            if (response && responseBodyCollector) {
                return {
                    response,
                    responseTimeStart,
                    responseBody: await responseBodyCollector.getBodyAsync(),
                    error: null,
                };
            } else if (error) {
                return {
                    response: null,
                    responseBody: null,
                    error,
                };
            } else {
                throw new Error('No responseBodyCollector');
            }
        })(),
    ]);

    loggerRequest.body = requestBody ? requestBody : null;

    if (response) {
        const loggerResponse: LoggerResponse = {
            timeStart: responseTimeStart ?? 0,
            status: response.statusCode ?? 0,
            body: responseBody ? responseBody : null,
            headers: response.headers as LoggerHeaders,
        };
        onRequestEnd({
            request: loggerRequest,
            response: loggerResponse,
            error: null,
        });
    } else if (error) {
        const loggerError = {
            message: error.message,
            code: (error as any).code as string,
            stack: error.stack ?? '',
        };
        onRequestEnd({
            request: loggerRequest,
            response: null,
            error: loggerError,
        });
    }
};

export interface GlobalHttpLoggerOptions {
    onRequestEnd: LoggerEventHandler;
    shouldLog?: LoggerShouldLog;
}

export default class GlobalHttpLogger {
    private onRequestEnd: LoggerEventHandler;
    private shouldLog?: LoggerShouldLog;
    constructor({ onRequestEnd, shouldLog }: GlobalHttpLoggerOptions) {
        this.onRequestEnd = onRequestEnd;
        this.shouldLog = shouldLog;
    }
    start(): void {
        const { onRequestEnd } = this;
        const interceptedRequestMethod = (
            object: any,
            func: any,
            ...rest: any
        ) => {
            const req = func.call(object, ...rest);
            interceptRequest(req, onRequestEnd, this.shouldLog);
            return req;
        };

        http.request = interceptedRequestMethod.bind(null, http, http.request);
        http.get = interceptedRequestMethod.bind(null, http, http.get);

        /**
         * https.request proxies to http.request for 8.x and earlier versions
         */
        if (nodeMajorVersion > 8) {
            https.get = interceptedRequestMethod.bind(null, https, https.get);
            https.request = interceptedRequestMethod.bind(
                null,
                https,
                https.request
            );
        }
    }
}
