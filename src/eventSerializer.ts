import { SerializedLoggerEvent } from './SerializedTypes';
import { LoggerEvent, ProcessData } from './SharedTypes';

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

export const serializeEvent = (
    event: LoggerEvent,
    processData: ProcessData
): SerializedLoggerEvent => {
    if (event.response) {
        return {
            request : serializeBody(event.request),
            response: serializeBody(event.response),
            error   : null,
            processData
        };
    }

    if (event.error) {
        return {
            request : serializeBody(event.request),
            response: null,
            error   : event.error,
            processData
        };
    }

    throw new Error('Cannot serialize');
};
