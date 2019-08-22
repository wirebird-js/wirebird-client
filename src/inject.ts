import GlobalHttpLogger from './GlobalHttpLogger';
import eventToPretty from './eventToPretty';
import eventToCurl from './eventToCurl';
import { LoggerEvent } from './SharedTypes';

const FORMAT_PRETTY = 'pretty';
const FORMAT_CURL = 'curl';

const getFormatter = (format?: string) => {
    switch (format) {
        case FORMAT_PRETTY:
            return eventToPretty;
        case FORMAT_CURL:
            return eventToCurl;
        default:
            return eventToPretty;
    }
};

export const main = () => {
    const {
        env: { HTTP_INSPECTOR_FORMAT: format }
    } = process;

    const formatter = getFormatter(format);

    const logger = new GlobalHttpLogger({
        onRequestEnd: (event: LoggerEvent) => {
            const curlCommand = formatter(event);
            console.log(curlCommand);
        }
    });
    logger.start();
};

main();
