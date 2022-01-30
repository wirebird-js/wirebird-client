import GlobalHttpLogger from './GlobalHttpLogger';
import eventToPretty from './eventToPretty';
import eventToCurl from './eventToCurl';
import { LoggerEvent, ProcessData } from './SharedTypes';
import axios from 'axios';
import { serializeEvent } from './eventSerializer';
import getProcessData from './getProcessData';
import { getMode } from './mode';

const UI_ENDPOINT_PATH = '/api/updates';
const DNT_HEADER = 'wirebird-do-not-track';

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
            `[wirebird] Failed to send event to ${uiUrl} ${e.message}`
        );
    }
}

export const main = (): void => {
    const mode = getMode(process.env.WIREBIRD ?? '');

    if (mode.type === 'disabled') {
        return;
    }

    const processData = getProcessData();

    const logger = new GlobalHttpLogger({
        shouldLog: (req) => {
            if (mode.type !== 'ui') {
                return true;
            }
            if (req.headers[DNT_HEADER]) {
                // Don't log own requests
                return false;
            }
            return true;
        },
        onRequestEnd: (event: LoggerEvent) => {
            if (mode.type === 'ui') {
                sendEventToMonitor(
                    `${mode.url}${UI_ENDPOINT_PATH}`,
                    event,
                    processData
                );
            }
            if (mode.type === 'curl') {
                console.log(eventToCurl(event));
                return;
            }
            if (mode.type === 'pretty') {
                console.log(eventToPretty(event));
                return;
            }
        },
    });
    logger.start();
};

main();
