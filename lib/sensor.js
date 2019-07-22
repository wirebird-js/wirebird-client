const GlobalHttpLogger = require('./GlobalHttpLogger');

exports.initialize = () => {
    const logger = new GlobalHttpLogger({
        onRequestEnd: ({ request, response }) => {
            //TODO: send this log to the UI server instead of logging it here
            console.log('REQ:', request);
            console.log('RES:', response);
        }
    });

    logger.start();
};
