import minimist from 'minimist';
import { ISpawn } from './types';

export class WBEnv {
    private spawn(command: string, args: string[], env: string) {
        const oldNodeOptions = this.processEnv.NODE_OPTIONS ?? '';
        const wirebirdClientInject = require.resolve('../inject');
        const nodeOptions =
            `${oldNodeOptions} --require ${wirebirdClientInject}`.trimStart();

        const envs = { NODE_OPTIONS: nodeOptions, WIREBIRD: env };
        const envsForLog = Object.entries(envs)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');
        const argsForLog = args.join(' ');

        //TODO: stderr
        console.log('[wbenv]', `${envsForLog} ${command} ${argsForLog}`);

        this.childProcessSpawn(command, args, {
            stdio: 'inherit',
            env  : {
                ...this.processEnv,
                NODE_OPTIONS: nodeOptions,
                WIREBIRD    : env,
            },
        });
    }

    private parse(argv: string[]) {
        const opts = minimist(argv, { '--': true });
        const host = opts.h;
        const [env, command, ...args] = opts['_'];
        const rest = opts['--'] ?? [];
        const fullArgs = [...args, ...rest];
        let envStr = env;
        if (env === 'ui' && host) {
            envStr = `ui:${host}`;
        }

        return this.spawn(command, fullArgs, envStr);
    }

    constructor(
        private childProcessSpawn: ISpawn,
        private processEnv: Record<string, string | undefined>
    ) {}

    execute(argv: string[]): void {
        return this.parse(argv);
    }
}
