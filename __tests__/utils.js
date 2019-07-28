const _ = require('lodash');

const removeUnstableData = input => {
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

const withReadableBuffers = input => {
    const output = _.cloneDeep(input);
    if (output.request && output.request.body) {
        output.request.body = output.request.body.toString('utf8');
    }
    if (output.response && output.response.body) {
        output.response.body = output.response.body.toString('utf8');
    }
    return output;
};

const prepareSnapshot = input => withReadableBuffers(removeUnstableData(input));

exports.removeUnstableData = removeUnstableData;
exports.withReadableBuffers = withReadableBuffers;
exports.prepareSnapshot = prepareSnapshot;
