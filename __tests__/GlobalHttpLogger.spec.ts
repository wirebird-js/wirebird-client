import axios from 'axios';
import sleep from 'sleep-promise';
import GlobalHttpLogger from '../src/GlobalHttpLogger';
import { prepareSnapshot } from './utils';

const skipTick = () => sleep(0);

describe('GlobalHttpLogger', () => {
    it('should not capture requests if shouldLog returns false', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({
            onRequestEnd,
            shouldLog: (req) => !req.headers['x-http-inspector-do-not-track'],
        });
        logger.start();
        const res = await axios.get('http://127.0.0.1:13000/get?a=b', {
            headers: {
                'x-http-inspector-do-not-track': '1',
            },
        });
        expect(res.data).toEqual('Hello World!');
        expect(res.status).toEqual(200);
        await skipTick();
        expect(onRequestEnd.mock.calls.length).toEqual(0);
    });
    it('should capture GET requests', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        const res = await axios.get('http://127.0.0.1:13000/get?a=b');
        expect(res.data).toEqual('Hello World!');
        expect(res.status).toEqual(200);
        await skipTick();
        expect(
            prepareSnapshot(onRequestEnd.mock.calls[0][0])
        ).toMatchSnapshot();
    });
    it('should capture POST requests', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        const res = await axios.post('http://127.0.0.1:13000/post', {
            foo: 'bar',
        });
        expect(res.data).toEqual({ hello: 'world' });
        expect(res.status).toEqual(200);
        await skipTick();
        expect(
            prepareSnapshot(onRequestEnd.mock.calls[0][0])
        ).toMatchSnapshot();
    });
    it('should capture GET requests with error response', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        const res = await axios.get('http://127.0.0.1:13000/get/404', {
            validateStatus: () => true,
        });
        expect(res.data).toEqual({ error: 'Not found' });
        expect(res.status).toEqual(404);
        await skipTick();
        expect(
            prepareSnapshot(onRequestEnd.mock.calls[0][0])
        ).toMatchSnapshot();
    });
    it('should capture GET requests with network error', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        await expect(
            axios.get('http://never.existing.host.asdfgh/', {
                validateStatus: () => true,
            })
        ).rejects.toThrow('getaddrinfo ENOTFOUND never.existing.host.asdfgh');
        await skipTick();
        const event = prepareSnapshot(onRequestEnd.mock.calls[0][0]);
        expect(event.request).toMatchSnapshot();
        expect(event.response).toEqual(null);
        expect(event.error?.code).toEqual('ENOTFOUND');
        expect([
            'getaddrinfo ENOTFOUND never.existing.host.asdfgh',
            'getaddrinfo ENOTFOUND never.existing.host.asdfgh never.existing.host.asdfgh:80',
        ]).toContain(event.error?.message);
    });

    it('should decode gzipped content', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        const res = await axios.get('http://127.0.0.1:13000/compressable', {
            headers: {
                'accept-encoding': 'gzip',
            },
        });
        expect(res.data).toEqual('Hello World!');
        expect(res.status).toEqual(200);
        await skipTick();
        expect(
            prepareSnapshot(onRequestEnd.mock.calls[0][0])
        ).toMatchSnapshot();
    });

    it('should allow multiple headers', async () => {
        const onRequestEnd = jest.fn();
        const logger = new GlobalHttpLogger({ onRequestEnd });
        logger.start();
        const res = await axios.get('http://127.0.0.1:13000/get?a=b', {
            headers: {
                one: ['two', 'three'],
            },
        });
        expect(res.data).toEqual('Hello World!');
        expect(res.status).toEqual(200);
        await skipTick();
        expect(
            prepareSnapshot(onRequestEnd.mock.calls[0][0])
        ).toMatchSnapshot();
    });
});
