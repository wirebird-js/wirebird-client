import GlobalHttpLogger from './GlobalHttpLogger';
import eventToPretty from './eventToPretty';
import eventToCurl from './eventToCurl';
import { LoggerEvent } from './SharedTypes';
import axios from 'axios';
import { serializeEvent } from './eventSerializer';

const MONITOR_DEFAULT_URL = 'http://localhost:4380/api/updates';
const DNT_HEADER = 'http-inspector-do-not-track';

const FORMAT_PRETTY = 'pretty';
const FORMAT_CURL = 'curl';
const FORMAT_MONITOR = 'monitor';

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
        env: {
            HTTP_INSPECTOR: env,
            HTTP_INSPECTOR_FORMAT: format,
            HTTP_INSPECTOR_MONITOR_URL: uiUrl = MONITOR_DEFAULT_URL
        }
    } = process;

    if (env !== 'true' && env !== 'on' && env !== '1' && env !== 'yes') {
        return;
    }

    const formatter = getFormatter(format);

    const logger = new GlobalHttpLogger({
        shouldLog: req => {
            if (format !== FORMAT_MONITOR) {
                return true;
            }
            if (req.headers[DNT_HEADER]) {
                return false;
            }
            return true;
        },
        onRequestEnd: (event: LoggerEvent) => {
            if (format === FORMAT_CURL || format === FORMAT_PRETTY) {
                const logMessage = formatter(event);
                console.log(logMessage);
                return;
            }
            if (format === FORMAT_MONITOR) {
                axios.post(uiUrl, serializeEvent(event), {
                    headers: {
                        [DNT_HEADER]: '1'
                    }
                });
            }
        }
    });
    logger.start();
};

main();
