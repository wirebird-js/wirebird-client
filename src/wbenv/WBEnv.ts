import dedent from 'dedent';
import minimist from 'minimist';
import { ISpawn } from './types';

export class WBEnv {
    private spawn(command: string, args: string[], env: string) {
        const oldNodeOptions = this.processEnv.NODE_OPTIONS ?? '';
        const wirebirdClientInject = this.injectScriptPath;
        const nodeOptions =
            `${oldNodeOptions} --require ${wirebirdClientInject}`.trimStart();

        const envs = { NODE_OPTIONS: nodeOptions, WIREBIRD: env };
        const envsForLog = Object.entries(envs)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');
        const argsForLog = args.join(' ');

        console.error(`[wbenv] ${envsForLog} ${command} ${argsForLog}`);

        this.childProcessSpawn(command, args, {
            stdio: 'inherit',
            env  : {
                ...this.processEnv,
                NODE_OPTIONS: nodeOptions,
                WIREBIRD    : env,
            },
        });
    }

    private parse(argv: string[]): number {
        const opts = minimist(argv, { stopEarly: true });
        const host = opts.h;
        const [first] = opts._;
        const envPassed = ['ui', 'curl', 'pretty'].includes(first);

        const positionals = envPassed ? opts._ : ['ui', ...opts._];

        const [env, command, ...args] = positionals;
        if (!command) {
            this.printUsage();
            return 1;
        }
        let envStr = env;
        if (env === 'ui' && host) {
            envStr = `ui:${host}`;
        }

        this.spawn(command, args, envStr);
        return 0;
    }

    private printUsage() {
        console.error(dedent`
            usage: wbenv [{ui|curl|pretty}] command [args...]
                ui     - send requests to Wirebird app
                curl   - log requests in the terminal as Curl commands
                pretty - log requests in the terminal`);
    }

    constructor(
        private childProcessSpawn: ISpawn,
        private processEnv: Record<string, string | undefined>,
        private injectScriptPath: string
    ) {}

    execute(argv: string[]): number {
        return this.parse(argv);
    }
}
