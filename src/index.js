const path = require('path');
const { readCacheFileContents, writeCacheToFS } = require('./file-utils');
const { cacheRecordIsStale, removeCacheRecord, getCurrentTimeStamp, generateExpiryTimestamp } = require('./cache-utils');

const CACHE_DIRECTORY = path.join(process.cwd(), '/.satchel-cache');
const CACHE_FILE_PATH = path.join(CACHE_DIRECTORY, '/cache.json');
const CACHE_LIFESPAN_MINUTES = 15;
const CACHE_LIFESPAN_MS = CACHE_LIFESPAN_MINUTES * 60 * 1000;

function all() {
    return readCacheFileContents(CACHE_FILE_PATH);
}

function write(cacheID, data) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    cacheFileContents[cacheID] = {
        expires: generateExpiryTimestamp(getCurrentTimeStamp(), CACHE_LIFESPAN_MS),
        data
    };
    return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
}

function read(cacheID) {
    try {
        let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
        if (cacheFileContents[cacheID]) {
            if (cacheRecordIsStale(cacheFileContents[cacheID])) {
                remove(cacheID);
                return undefined;
            }
            return cacheFileContents[cacheID].data;
        }
        return undefined;
    } catch (e) {
        console.error('[READ] error: ', e);
        return undefined;
    }
}

function remove(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    cacheFileContents = removeCacheRecord(cacheFileContents, cacheID);
    return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
}

function hydrate(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        cacheFileContents[cacheID].expires = generateExpiryTimestamp(getCurrentTimeStamp(), CACHE_LIFESPAN_MS);
        return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
    }
    return false;
}

function invalidate(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        cacheFileContents[cacheID].expires = getCurrentTimeStamp();
        return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
    }
    return false;
}

function getExpiry(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    return cacheFileContents[cacheID]?.expires || undefined;
}

function setExpiry(cacheID, timestamp) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        cacheFileContents[cacheID].expires = timestamp;
        return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
    }
    return false;
}

module.exports = {
    all,
    write,
    read,
    remove,
    hydrate,
    invalidate,
    getExpiry,
    setExpiry,
};