import { LoggerEvent } from './SharedTypes';
import escape from 'shell-escape';

export default function eventToCurl(event: LoggerEvent): string {
    const { request } = event;
    const chunks: Array<string> = [];
    chunks.push('curl');
    chunks.push(request.url);
    chunks.push('-X');
    chunks.push(request.method);

    for (const [key, value] of Object.entries(request.headers)) {
        chunks.push('-H');

        chunks.push(`${key}: ${value}`);
    }

    if (request.body) {
        chunks.push('--data-binary');
        chunks.push(request.body.toString('utf8'));
    }

    chunks.push('--compressed');
    chunks.push('-i');
    return escape(chunks);
}
