const axios = require('axios');
const sleep = require('sleep-promise');
const GlobalHttpLogger = require('../lib/GlobalHttpLogger');
const { removeUnstableData } = require('./utils');

it('should capture get requests', async () => {
    const onRequestEnd = jest.fn();
    const logger = new GlobalHttpLogger({ onRequestEnd });
    logger.start();
    const res = await axios.get('http://127.0.0.1:13000/get?a=b');
    expect(res.data).toEqual('Hello World!');
    expect(res.status).toEqual(200);

    await sleep(100);
    expect(removeUnstableData(onRequestEnd.mock.calls[0][0])).toEqual({
        error: null,
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

it('should capture get requests with error response', async () => {
    const onRequestEnd = jest.fn();
    const logger = new GlobalHttpLogger({ onRequestEnd });
    logger.start();
    const res = await axios.get('http://127.0.0.1:13000/get/404', {
        validateStatus: () => true
    });
    expect(res.data).toEqual({ error: 'Not found' });
    expect(res.status).toEqual(404);

    await sleep(100);
    expect(removeUnstableData(onRequestEnd.mock.calls[0][0])).toEqual({
        error: null,
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

it('should capture get requests with network error', async () => {
    const onRequestEnd = jest.fn();
    const logger = new GlobalHttpLogger({ onRequestEnd });
    logger.start();

    await expect(
        axios.get('http://never.existing.host.asdfgh/', {
            validateStatus: () => true
        })
    ).rejects.toThrow(
        'getaddrinfo ENOTFOUND never.existing.host.asdfgh never.existing.host.asdfgh:80'
    );

    await sleep(100);

    expect(removeUnstableData(onRequestEnd.mock.calls[0][0])).toEqual({
        error: {
            code: 'ENOTFOUND',
            message:
                'getaddrinfo ENOTFOUND never.existing.host.asdfgh never.existing.host.asdfgh:80'
        },
        request: {
            url: 'http://never.existing.host.asdfgh/',
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                host: 'never.existing.host.asdfgh',
                'user-agent': 'axios/0.19.0'
            },
            body: null
        },
        response: null
    });
});
