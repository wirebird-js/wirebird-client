import axios from 'axios';
import superagent from 'superagent';
import request from 'request-promise-native';

import { startCurlLogger } from '../curlLogger';

const main = async () => {
    startCurlLogger();
    await axios.get('https://example.com');
    await axios.get('https://google.com');

    await axios.post('https://httpbin.org/post', { hello: 'axios' });
    await superagent
        .post('https://httpbin.org/post')
        .send({ hello: 'superagent' })
        .end();
    await request({
        method: 'post',
        uri   : 'https://httpbin.org/post',
        json  : true,
        body  : { hello: 'request' }
    });
};

main().catch(e => {
    console.error(e.stack);
    process.exit(1);
});
