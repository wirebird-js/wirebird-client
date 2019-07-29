import GlobalHttpLogger from './GlobalHttpLogger';
import requestToCurl from './requestToCurl';

export const startCurlLogger = () => {
    const logger = new GlobalHttpLogger({
        onRequestEnd: event => {
            const curlCommand = requestToCurl(event.request);
            console.log(curlCommand);
        }
    });
    logger.start();
};
