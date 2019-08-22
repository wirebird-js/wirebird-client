import GlobalHttpLogger from './GlobalHttpLogger';
import requestToCurl from './requestToCurl';
import { LoggerEvent } from './SharedTypes';

export const main = () => {
    const logger = new GlobalHttpLogger({
        onRequestEnd: (event: LoggerEvent) => {
            if (event.request) {
                const curlCommand = requestToCurl(event.request);
                console.log(curlCommand);
            }
        }
    });
    logger.start();
};

main();