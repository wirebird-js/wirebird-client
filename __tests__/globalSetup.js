const server = require('./server');

module.exports = () => {
    console.log('Starting server');
    server.start();
};
