exports.removeUnstableData = data => {
    const {
        request,
        response,
        response: {
            headers: { date, etag, ...responseHeaders }
        }
    } = data;
    return {
        request,
        response: { ...response, headers: responseHeaders }
    };
};
