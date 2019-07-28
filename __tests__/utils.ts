import { LoggerEvent } from '../src/SharedTypes';
const _ = require('lodash');

export const removeUnstableData = (
    input: LoggerEvent
): LoggerEvent => {
    const output = _.cloneDeep(input);
    if (output.response) {
        if (output.response.headers) {
            delete output.response.headers.date;
            delete output.response.headers.etag;
        }
    }
    if (output.error) {
        delete output.error.stack;
    }

    return output;
};

export const withReadableBuffers = (
    input: LoggerEvent
): LoggerEvent => {
    const output = _.cloneDeep(input);
    if (output.request && output.request.body) {
        output.request.body = output.request.body.toString('utf8');
    }
    if (output.response && output.response.body) {
        output.response.body = output.response.body.toString('utf8');
    }
    return output;
};

export const prepareSnapshot = (
    input: LoggerEvent
): LoggerEvent => withReadableBuffers(removeUnstableData(input));
