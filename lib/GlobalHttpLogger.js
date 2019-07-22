const http = require('http');
const https = require('https');
const nodeMajorVersion = +process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/)[1];

class ResponseBodyCollector {
    constructor(response) {
        this.buffers = [];
        this.bodyPromise = new Promise((resolve, reject) => {
            response.on('data', chunk => {
                this.buffers.push(chunk);
            });
            response.on('end', () => {
                const body = Buffer.concat(this.buffers);
                resolve(body);
            });
        });
    }
    getBodyAsync() {
        return this.bodyPromise;
    }
}

const waitForResponseOrError = request =>
    new Promise((resolve, reject) => {
        request.prependOnceListener('response', response => {
            response.bodyCollector = new ResponseBodyCollector(response);
            resolve({ response });
        });
        request.prependOnceListener('error', error => resolve({ error }));
    });

const collectRequestBody = request =>
    new Promise((resolve, reject) => {
        const requestBody = [];

        const reqWrite = request.write;
        request.write = function() {
            /**
             * chunk can be either a string or a Buffer.
             */
            const chunk = arguments[0];

            if (Buffer.isBuffer(chunk)) {
                requestBody.push(chunk);
            } else {
                requestBody.push(Buffer.from(chunk, 'utf8'));
            }

            return reqWrite.apply(this, arguments);
        };

        const reqEnd = request.end;
        request.end = function() {
            /**
             * the first argument might be a callback or a chunk
             */
            const maybeChunk = arguments[0];

            if (Buffer.isBuffer(maybeChunk)) {
                requestBody.push(maybeChunk);
            } else if (maybeChunk && typeof maybeChunk !== 'function') {
                requestBody.push(Buffer.from(maybeChunk, 'utf8'));
            }

            return reqEnd.apply(this, arguments);
        };

        request.prependOnceListener('finish', () => {
            if (!requestBody.length) {
                resolve(null);
            } else {
                resolve(Buffer.concat(requestBody));
            }
        });
    });

const interceptRequest = async (request, { onRequestEnd }) => {
    const requestBody = await collectRequestBody(request);
    let responseBody = null;

    const { response, error } = await waitForResponseOrError(request);
    if (response) {
        responseBody = await response.bodyCollector.getBodyAsync();
    } else if (error) {
        debugger;
    }

    const protocol = request.agent.protocol;
    const host = request.getHeader('host');
    const path = request.path;

    onRequestEnd({
        request: {
            url: `${protocol}//${host}${path}`,
            method: request.method,
            headers: request._headers,
            body: requestBody
        },
        response: {
            status: response.statusCode,
            body: responseBody,
            headers: response.headers
        }
    });
};

module.exports = class GlobalHttpLogger {
    constructor({ onRequestEnd }) {
        this.onRequestEnd = onRequestEnd;
    }
    start() {
        const { onRequestEnd } = this;
        const interceptedRequestMethod = (object, func, ...rest) => {
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
};
