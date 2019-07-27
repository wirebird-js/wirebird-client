const _ = require('lodash');

exports.removeUnstableData = input => {
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
