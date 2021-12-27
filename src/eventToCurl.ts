import { LoggerEvent } from './SharedTypes';
import escape from 'shell-escape';

interface EventToCurlOptions {
    prettyPrint?: boolean;
}

export default function eventToCurl(
    event: LoggerEvent,
    { prettyPrint = false }: EventToCurlOptions = {}
): string {
    const { request } = event;
    const lines: string[][] = [];
    lines.push(['curl', request.url]);
    lines.push(['-X', request.method]);

    for (const [key, value] of Object.entries(request.headers)) {
        lines.push(['-H', `${key}: ${value}`]);
    }

    if (request.body) {
        lines.push(['--data-binary', request.body.toString('utf8')]);
    }

    lines.push(['--compressed']);
    lines.push(['-i']);

    const separator = prettyPrint ? ' \\\n' : ' ';

    return lines.map((line) => escape(line)).join(separator);
}
