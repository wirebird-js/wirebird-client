// https://github.com/Microsoft/TypeScript-Babel-Starter

import http, { ClientRequest, ServerResponse, IncomingMessage } from 'http';
import https from 'https';
import {
    LoggerEvent,
    LoggerHeaders,
    LoggerRequest,
    LoggerResponse,
    LoggerEventHandler
} from './SharedTypes';

const matches = process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
const nodeMajorVersion = matches ? +matches[1] : 0;

interface ClientRequestWithUndocumentedMembers extends ClientRequest {
    agent: any;
    method: string;
    _headers: { [headerName: string]: string };
}

// interface ServerResponseWithUndocumentedMembers extends ServerResponse {
//     headers: { [headerName: string]: string };
// }

class ResponseBodyCollector {
    buffers: Array<Buffer>;

    bodyPromise: Promise<Buffer>;

    constructor(response: IncomingMessage) {
        this.buffers = [];
        this.bodyPromise = new Promise((resolve, reject) => {
            response.prependListener('data', chunk => {
                this.buffers.push(chunk);
            });
            response.prependListener('end', () => {
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
    error?: Error;
}> =>
    new Promise((resolve, reject) => {
        request.prependOnceListener('response', response => {
            const responseBodyCollector = new ResponseBodyCollector(response);
            resolve({ response, responseBodyCollector });
        });
        request.prependOnceListener('error', error => {
            resolve({ error });
        });
    });

const collectRequestBody = (request: ClientRequest): Promise<Buffer | null> =>
    new Promise((resolve, reject) => {
        const requestBody: Array<Buffer> = [];

        const reqWrite = request.write;
        request.write = function(...args: any) {
            /**
             * chunk can be either a string or a Buffer.
             */
            const chunk = arguments[0];

            if (Buffer.isBuffer(chunk)) {
                requestBody.push(chunk);
            } else {
                requestBody.push(Buffer.from(chunk, 'utf8'));
            }

            return reqWrite.apply(this, args);
        };

        const reqEnd = request.end;
        request.end = function(...args: any) {
            /**
             * the first argument might be a callback or a chunk
             */
            const maybeChunk = arguments[0];

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
    {
        onRequestEnd
    }: { onRequestEnd: (payload: LoggerEvent) => void }
) => {
    const [requestBody, { response, responseBody, error }] = await Promise.all([
        collectRequestBody(request),
        (async () => {
            const {
                response,
                responseBodyCollector,
                error
            } = await waitForResponseOrError(request);
            if (response && responseBodyCollector) {
                return {
                    response,
                    responseBody: await responseBodyCollector.getBodyAsync(),
                    error: null
                };
            } else if (error) {
                return {
                    response: null,
                    responseBody: null,
                    error
                };
            } else {
                throw new Error('No responseBodyCollector');
            }
        })()
    ]);

    const protocol = (request as ClientRequestWithUndocumentedMembers).agent
        .protocol;
    const host = request.getHeader('host');
    const path = request.path;

    const loggerRequest: LoggerRequest = {
        url: `${protocol}//${host}${path}`,
        method: (request as ClientRequestWithUndocumentedMembers).method,
        headers: (request as ClientRequestWithUndocumentedMembers)._headers,
        body: requestBody ? requestBody : null
    };
    if (response) {
        const loggerResponse: LoggerResponse = {
            status: response.statusCode || 0,
            body: responseBody ? responseBody : null,
            headers: response.headers as LoggerHeaders
        };
        onRequestEnd({
            request: loggerRequest,
            response: loggerResponse,
            error: null
        });
    } else if (error) {
        const loggerError = {
            message: error.message,
            code: (error as any).code as string,
            stack: error.stack || ''
        };
        onRequestEnd({
            request: loggerRequest,
            response: null,
            error: loggerError
        });
    }
};

export default class GlobalHttpLogger {
    onRequestEnd: LoggerEventHandler;
    constructor({ onRequestEnd }: { onRequestEnd: LoggerEventHandler }) {
        this.onRequestEnd = onRequestEnd;
    }
    start() {
        const { onRequestEnd } = this;
        const interceptedRequestMethod = (
            object: any,
            func: any,
            ...rest: any
        ) => {
            const req = func.call(object, ...rest);
            interceptRequest(req, { onRequestEnd });
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
    stop() {}
}
