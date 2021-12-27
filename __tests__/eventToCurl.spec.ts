import eventToCurl from '../src/eventToCurl';
import { LoggerEvent } from '../src/SharedTypes';

const mockEvent: LoggerEvent = {
    error: {
        code   : '',
        message: '',
        stack  : '',
    },
    request: {
        id           : '',
        timeStart    : 0,
        remoteAddress: '',
        body         : Buffer.from('hello', 'utf8'),
        method       : 'PUT',
        url          : 'http://127.0.0.1:8080/test/endpoint',
        headers      : {
            foo: 'bar',
        },
    },
    response: null,
};

describe('eventToCurl', () => {
    it('should serialize a request', () => {
        expect(eventToCurl(mockEvent)).toEqual(
            'curl \'http://127.0.0.1:8080/test/endpoint\' -X PUT -H \'foo: bar\' --data-binary hello --compressed -i'
        );
    });

    it('should serialize a request as a pretty-printed command', () => {
        expect(eventToCurl(mockEvent, { prettyPrint: true })).toEqual(
            `curl \'http://127.0.0.1:8080/test/endpoint\' \\
-X PUT \\
-H 'foo: bar' \\
--data-binary hello \\
--compressed \\
-i`
        );
    });
});
