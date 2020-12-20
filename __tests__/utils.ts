import { LoggerEvent } from '../src/SharedTypes';
import cloneDeep from 'lodash/cloneDeep';

export const removeUnstableData = (input: LoggerEvent): LoggerEvent => {
    const output = cloneDeep(input) as any;
    if (output.request.timeStart) {
        output.request.timeStart = 1;
    }
    if (output.request.id) {
        output.request.id = '[presents]';
    }
    if (output.response) {
        if (output.response.headers) {
            delete output.response.headers.date;
            delete output.response.headers.etag;
        }
        if (output.response.timeStart) {
            output.response.timeStart = 1;
        }
    }
    if (output.error) {
        delete output.error.stack;
    }

    return output;
};

export const withReadableBuffers = (input: LoggerEvent): LoggerEvent => {
    const output = cloneDeep(input) as any;
    if (output.request?.body) {
        output.request.body = output.request.body.toString('utf8');
    }
    if (output.response?.body) {
        output.response.body = output.response.body.toString('utf8');
    }
    return output;
};

export const prepareSnapshot = (input: LoggerEvent): LoggerEvent =>
    withReadableBuffers(removeUnstableData(input));
