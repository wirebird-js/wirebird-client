// eslint-disable-next-line @typescript-eslint/no-var-requires
const server = require('./server');

module.exports = () => {
    console.log('Stopping server');
    server.stop();
};
