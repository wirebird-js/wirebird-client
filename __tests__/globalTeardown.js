const server = require('./server');

module.exports = () => {
    console.log('Stopping server');
    server.stop();
};
