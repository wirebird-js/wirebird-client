/* eslint-disable @typescript-eslint/no-var-requires */
const server = require('./server');

module.exports = () => {
    console.log('Starting server');
    server.start();
};
