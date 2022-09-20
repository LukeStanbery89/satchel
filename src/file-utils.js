'use strict';

const fs = require('fs');
const path = require('path');

function readCacheFileContents(cacheFilePath) {
    try {
        const cacheFileContents = fs.readFileSync(cacheFilePath);
        if (cacheFileContents === undefined) {
            return {};
        }
        return JSON.parse(cacheFileContents);
    } catch (e) {
        const cachefileDir = path.dirname(cacheFilePath);
        if (!fs.existsSync(cachefileDir)) {
            console.log('Creating cache directory...');
            fs.mkdirSync(cachefileDir);
        } else {
            console.error('[GET_CACHE_FILE_ERROR]', cacheFilePath, e);
        }
        return {};
    }
}

function writeCacheToFS(cacheFilePath, cacheFileContents) {
    try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheFileContents));
        return true;
    } catch (e) {
        console.error('[WRITE_CACHE_TO_FS_ERROR]', cacheFilePath, typeof cacheFileContents, cacheFileContents, e);
        return false;
    }
}

module.exports = {
    readCacheFileContents,
    writeCacheToFS,
};