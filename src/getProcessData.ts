function getProcessData() {
    return {
        pid: process.pid,
        title: process.title || '',
        mainModule: require.main ? require.main.filename : ''
    };
}

export default getProcessData;
