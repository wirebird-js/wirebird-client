import axios from 'axios';
import { startCurlLogger } from '../curlLogger';

const main = async () => {
    startCurlLogger();
    await axios.get('https://example.com');
    await axios.get('https://google.com');
};

main().catch(e => {
    console.error(e.stack);
    process.exit(1);
});
