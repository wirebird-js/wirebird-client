import { serializeEvent } from '../src/eventSerializer';
import { LoggerEvent } from '../src/main';
import { ProcessData } from '../src/SharedTypes';
import { validate } from '../src/validate';

describe('validate', () => {
    const event: LoggerEvent = {
        request: {
            id     : '1',
            body   : new Buffer('hello world', 'utf8'),
            headers: {
                hello: 'world',
            },
            method   : 'GET',
            timeStart: 0,
            url      : 'https://example.com',
        },
        response: {
            body   : new Buffer('hello world', 'utf8'),
            headers: {
                hello: 'world',
            },
            rawHeaders: ['Hello', 'world'],
            status    : 200,
            timeStart : 0,
        },
        error: null,
    };

    const processData: ProcessData = {
        mainModule: 'index.js',
        pid       : 1,
        title     : 'node',
    };
    const serializedEvent = serializeEvent(event, processData);

    it('should be a correctly serialized event', () => {
        expect(serializedEvent).toMatchSnapshot();
    });

    it('should validate a correct event', () => {
        const res = validate(serializedEvent);
        expect(res.errors).toEqual([]);
        expect(res.valid).toEqual(true);
    });

    it('should validate an incorrect event', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrongEvent = serializedEvent as any;
        const res = validate({
            ...wrongEvent,
            request: { ...wrongEvent.request, url: null },
        });
        expect(
            res.errors.map((e) => ({
                message : e.message,
                property: e.property,
            }))
        ).toMatchSnapshot();
        expect(res.valid).toEqual(false);
    });
});
