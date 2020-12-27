import { getMode, Mode } from '../src/mode';

describe('getMode', () => {
    it('should parse curl mode', () => {
        const m = getMode('curl');
        expect(m).toEqual(<Mode>{
            type: 'curl',
        });
    });
    it('should parse pretty mode', () => {
        const m = getMode('pretty');
        expect(m).toEqual(<Mode>{
            type: 'pretty',
        });
    });
    it('should parse ui mode', () => {
        const m = getMode('ui');
        expect(m).toEqual(<Mode>{
            type: 'ui',
            url : 'http://localhost:4380',
        });
    });
    it('should parse ui mode with a colon', () => {
        const m = getMode('ui:');
        expect(m).toEqual(<Mode>{
            type: 'ui',
            url : 'http://localhost:4380',
        });
    });
    it('should parse ui mode with URL provided', () => {
        const m = getMode('ui:https://example.com:2000');
        expect(m).toEqual(<Mode>{
            type: 'ui',
            url : 'https://example.com:2000',
        });
    });
    it('should parse empty as disabled', () => {
        const m = getMode('');
        expect(m).toEqual(<Mode>{
            type: 'disabled',
        });
    });
    it('should parse garbage as disabled', () => {
        const m = getMode('helloworld');
        expect(m).toEqual(<Mode>{
            type: 'disabled',
        });
    });
});
