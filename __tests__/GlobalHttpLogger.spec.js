const axios = require('axios');
const sleep = require('sleep-promise');
const GHL = require('../lib/GlobalHttpLogger');
const { removeUnstableData } = require('./utils');

it('test', async () => {
    const onRequestEnd = jest.fn();
    const logger = new GHL({ onRequestEnd });
    logger.start();
    const res = await axios.get('http://127.0.0.1:13000/get?a=b');
    expect(res.data).toEqual('Hello World!');
    expect(res.status).toEqual(200);

    await sleep(100);
    expect(removeUnstableData(onRequestEnd.mock.calls[0][0])).toEqual({
        request: {
            url: 'http://127.0.0.1:13000/get?a=b',
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                host: '127.0.0.1:13000',
                'user-agent': 'axios/0.19.0'
            },
            body: null
        },
        response: {
            status: 200,
            headers: {
                connection: 'close',
                'content-length': '12',
                'content-type': 'text/html; charset=utf-8',
                'x-powered-by': 'Express'
            },
            body: Buffer.from('Hello World!')
        }
    });
});

it('test2', async () => {
    const onRequestEnd = jest.fn();
    const logger = new GHL({ onRequestEnd });
    logger.start();
    const res = await axios.get('http://127.0.0.1:13000/get/404', {
        validateStatus: () => true
    });
    expect(res.data).toEqual({ error: 'Not found' });
    expect(res.status).toEqual(404);

    await sleep(100);
    expect(removeUnstableData(onRequestEnd.mock.calls[0][0])).toEqual({
        request: {
            url: 'http://127.0.0.1:13000/get/404',
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                host: '127.0.0.1:13000',
                'user-agent': 'axios/0.19.0'
            },
            body: null
        },
        response: {
            status: 404,
            headers: {
                connection: 'close',
                'content-length': '21',
                'content-type': 'application/json; charset=utf-8',
                'x-powered-by': 'Express'
            },
            body: Buffer.from(JSON.stringify({ error: 'Not found' }))
        }
    });
});
