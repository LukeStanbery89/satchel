const fs = require('fs');

function readCacheFileContents(cacheFilePath) {
    // console.log('!!! READ FROM CACHE FILE !!!');
    try {
        const cacheFileContents = fs.readFileSync(cacheFilePath);
        return JSON.parse(cacheFileContents);
    } catch (e) {
        console.error('[GET_CACHE_FILE] error: ', e);
        if (!fs.existsSync(cacheFilePath)) {
            fs.mkdirSync(cacheFilePath);
        }
        return {};
    }
}

function writeCacheToFS(cacheFilePath, cacheFileContents) {
    try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheFileContents));
        return true;
    } catch (e) {
        console.error('[WRITE_CACHE_TO_FS] error: ', e, cacheFilePath, cacheFileContents, typeof cacheFileContents);
        return false;
    }
}

module.exports = {
    readCacheFileContents,
    writeCacheToFS,
};