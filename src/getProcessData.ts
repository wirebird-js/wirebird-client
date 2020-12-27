import { ProcessData } from './SharedTypes';

function getProcessData(): ProcessData {
    return {
        pid       : process.pid,
        title     : process.title || '',
        mainModule: require.main ? require.main.filename : '',
    };
}

export default getProcessData;
