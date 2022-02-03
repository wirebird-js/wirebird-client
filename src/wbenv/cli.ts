import { spawnSync } from 'child_process';
import { WBEnv } from './WBEnv';

const wbenv = new WBEnv(spawnSync, process.env);
wbenv.execute(process.argv.slice(2));
