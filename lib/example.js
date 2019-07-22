const axios = require('axios');
const sensor = require('./sensor');
sensor.initialize();

const main = async () => {
    try {
        const res = await axios.get('https://via.placeholder.com/350x150');
        // const res = await axios.post('https://example.com/', {
        //     hello: 'world'
        // });
        console.log(res.status);
    } catch (e) {
        console.log(e.response ? e.response.status : e);
    }
};

main().catch(e => {
    console.error(e.stack);
    process.exit(1);
});
