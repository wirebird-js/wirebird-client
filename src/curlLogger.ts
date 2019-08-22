import GlobalHttpLogger from './GlobalHttpLogger';
import eventToCurl from './eventToCurl';
import { LoggerEvent } from './SharedTypes';

export const startCurlLogger = () => {
    const logger = new GlobalHttpLogger({
        onRequestEnd: (event: LoggerEvent) => {
            const curlCommand = eventToCurl(event);
            console.log(curlCommand);
        }
    });
    logger.start();
};
