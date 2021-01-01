import { fixHeaders } from '../src/fixHeaders';

describe('fixHeaders', () => {
    it('should convert headers like {0:"foo",1:"bar"} into ["foo", "bar"]', () => {
        expect(
            fixHeaders({
                num  : 1,
                str  : 'hello',
                arr  : ['pupa', 'lupa'],
                obj  : { 0: 'biba', 1: 'boba' },
                undef: undefined,
            })
        ).toEqual({
            num  : 1,
            str  : 'hello',
            arr  : ['pupa', 'lupa'],
            obj  : ['biba', 'boba'],
            undef: undefined,
        });
    });
});
