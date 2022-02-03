import { ISpawn } from '../../src/wbenv/types';
import { WBEnv } from '../../src/wbenv/WBEnv';

describe('WBEnv', () => {
    it('should return 1 if no command provided', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute([]);
        expect(exitCode).toEqual(1);
        expect(mockSpawn).not.toBeCalled();
    });

    it('should return 1 if no command provided (with -h)', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('-h http://localhost:8080'.split(' '));
        expect(exitCode).toEqual(1);
        expect(mockSpawn).not.toBeCalled();
    });

    it('should execute ui command with non-standart host by default', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute(
            '-h http://localhost:8080 yarn -D add hello'.split(' ')
        );
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "yarn",
                Array [
                  "-D",
                  "add",
                  "hello",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui:http://localhost:8080",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command by default', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('yarn -D add hello'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "yarn",
                Array [
                  "-D",
                  "add",
                  "hello",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command containing -options', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('ui yarn -D add hello'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "yarn",
                Array [
                  "-D",
                  "add",
                  "hello",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('ui node my-server.js'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute curl command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('curl node my-server.js'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "curl",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute pretty command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('pretty node my-server.js'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "pretty",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command merging the existing NODE_OPTIONS', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            {
                FOO         : 'bar',
                NODE_OPTIONS: '--foo=bar',
            },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute('ui node my-server.js'.split(' '));
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--foo=bar --require wirebird-client/inject",
                    "WIREBIRD": "ui",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command with -h parameter', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute(
            '-h http://localhost:8080 ui node my-server.js'.split(' ')
        );
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui:http://localhost:8080",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command passing all the rest parameters to the sub-command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute(
            'ui node my-server.js -h hello'.split(' ')
        );
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                  "-h",
                  "hello",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });

    it('should execute ui command with -h parameter passing all the rest parameters to the sub-command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(
            mockSpawn,
            { FOO: 'bar' },
            'wirebird-client/inject'
        );
        const exitCode = wbenv.execute(
            '-h http://localhost:8080 ui node my-server.js -- -h hello -m world'.split(
                ' '
            )
        );
        expect(exitCode).toEqual(0);
        expect(mockSpawn.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "node",
                Array [
                  "my-server.js",
                  "-h",
                  "hello",
                  "-m",
                  "world",
                ],
                Object {
                  "env": Object {
                    "FOO": "bar",
                    "NODE_OPTIONS": "--require wirebird-client/inject",
                    "WIREBIRD": "ui:http://localhost:8080",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });
});
