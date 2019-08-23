const express = require('express');
const compression = require('compression');
const app = express();
const port = 13000;

app.use(
    compression({
        threshold: '5'
    })
);

app.get('/get', (req, res) => res.send('Hello World!'));
app.post('/post', (req, res) => res.json({ hello: 'world' }));
app.get('/get/404', (req, res) => res.status(404).json({ error: 'Not found' }));
app.get('/compressable', (req, res) => res.send('Hello World!'));

module.exports = {
    start() {
        return new Promise(resolve => {
            this.server = app.listen(port, () => {
                console.log(`Listening on port ${port}!`);
                resolve();
            });
        });
    },
    stop() {
        this.server.close();
    }
};
