import { ISpawn } from '../../src/wbenv/types';
import { WBEnv } from '../../src/wbenv/WBEnv';

describe('WBEnv', () => {
    const injectModule = require.resolve('../../src/inject');
    it('should execute ui command', () => {
        const mockSpawn = jest.fn() as jest.MockedFunction<ISpawn>;
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute(['ui', 'node', 'my-server.js']);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute(['curl', 'node', 'my-server.js']);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute(['pretty', 'node', 'my-server.js']);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, {
            FOO         : 'bar',
            NODE_OPTIONS: '--foo=bar',
        });
        wbenv.execute(['ui', 'node', 'my-server.js']);
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
                    "NODE_OPTIONS": "--foo=bar --require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute([
            'ui',
            '-h',
            'http://localhost:8080',
            'node',
            'my-server.js',
        ]);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute(['ui', 'node', 'my-server.js', '--', '-h', 'hello']);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
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
        const wbenv = new WBEnv(mockSpawn, { FOO: 'bar' });
        wbenv.execute([
            'ui',
            'node',
            '-h',
            'http://localhost:8080',
            'my-server.js',
            '--',
            '-h',
            'hello',
            '-m',
            'world',
        ]);
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
                    "NODE_OPTIONS": "--require ${injectModule}",
                    "WIREBIRD": "ui:http://localhost:8080",
                  },
                  "stdio": "inherit",
                },
              ],
            ]
        `);
    });
});
