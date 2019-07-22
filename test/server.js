const express = require('express');
const app = express();
const port = 13000;

app.get('/get', (req, res) => res.send('Hello World!'));
app.post('/post', (req, res) => res.json({ hello: 'world' }));
app.get('/get/404', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
