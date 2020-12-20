import GlobalHttpLogger from './GlobalHttpLogger';
import eventToPretty from './eventToPretty';
import eventToCurl from './eventToCurl';
import { LoggerEvent, ProcessData } from './SharedTypes';
import axios from 'axios';
import { serializeEvent } from './eventSerializer';
import getProcessData from './getProcessData';

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

async function sendEventToMonitor(
    uiUrl: string,
    event: LoggerEvent,
    processData: ProcessData
) {
    try {
        await axios.post(uiUrl, serializeEvent(event, processData), {
            headers: {
                [DNT_HEADER]: '1',
            },
        });
    } catch (e) {
        console.error(
            `[http-inspector] Failed to send event to ${uiUrl} ${e.message}`
        );
    }
}

export const main = (): void => {
    const {
        env: {
            HTTP_INSPECTOR: env,
            HTTP_INSPECTOR_FORMAT: format = FORMAT_PRETTY,
            HTTP_INSPECTOR_MONITOR_URL: uiUrl = MONITOR_DEFAULT_URL,
        },
    } = process;

    if (env !== 'true' && env !== 'on' && env !== '1' && env !== 'yes') {
        return;
    }
    const processData = getProcessData();

    const formatter = getFormatter(format);

    const logger = new GlobalHttpLogger({
        shouldLog: (req) => {
            if (format !== FORMAT_MONITOR) {
                return true;
            }
            if (req.headers[DNT_HEADER]) {
                // Don't log own requests
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
                sendEventToMonitor(uiUrl, event, processData);
            }
        },
    });
    logger.start();
};

main();
