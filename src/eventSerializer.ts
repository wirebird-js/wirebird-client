import { SerializedLoggerEvent } from './SerializedTypes';
import { LoggerEvent } from './SharedTypes';

function serializeBody<T>(data: T): T & { body?: string } {
    const _data = (data as any) as { body?: Buffer };
    if (!_data.body) {
        return data;
    }

    return {
        ...data,
        body: _data.body.toString('base64')
    };
}

export const serializeEvent = (event: LoggerEvent): SerializedLoggerEvent => {
    if (event.response) {
        return {
            request: serializeBody(event.request),
            response: serializeBody(event.response),
            error: null
        };
    }

    if (event.error) {
        return {
            request: serializeBody(event.request),
            response: null,
            error: event.error
        };
    }

    throw new Error('Cannot serialize');
};
