const path = require('path');
const { readCacheFileContents, writeCacheToFS } = require('./file-utils');
const { cacheRecordIsStale, removeCacheRecord, getCurrentTimeStamp, generateExpiryTimestamp } = require('./cache-utils');

const CACHE_DIRECTORY = path.join(process.cwd(), '/.satchel-cache');
const CACHE_FILE_PATH = path.join(CACHE_DIRECTORY, '/cache.json');
const CACHE_DEFAULT_LIFESPAN_MINUTES = 15;
const CACHE_LIFESPAN_MODIFIER = 60 * 1000;

/**
 * Retrieves the entire store contents.
 * 
 * @returns {object}
 */
function all() {
    return readCacheFileContents(CACHE_FILE_PATH);
}

/**
 * Writes a new record to the store.
 * 
 * @param {string} cacheID - The key to store record.
 * @param {*} - The value to be stored.
 * 
 * @returns {boolean}
 */
function write(cacheID, data, lifespan = CACHE_DEFAULT_LIFESPAN_MINUTES) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    cacheFileContents[cacheID] = {
        expires: generateExpiryTimestamp(getCurrentTimeStamp(), lifespan * CACHE_LIFESPAN_MODIFIER),
        data
    };
    return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
}

/**
 * Reads a record from the store.
 * 
 * @param {string} cacheID - The key of the store record to be read.
 * 
 * @returns {object}
 */
function read(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        if (cacheRecordIsStale(cacheFileContents[cacheID])) {
            remove(cacheID);
            return undefined;
        }
        return cacheFileContents[cacheID].data;
    }
    return undefined;
}

/**
 * Removes a record from the store. 
 * 
 * @param {string} cacheID - The key of the store record to be removed.
 * 
 * @returns {boolean}
 */
function remove(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    cacheFileContents = removeCacheRecord(cacheFileContents, cacheID);
    return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
}

/**
 * Refreshes the expiry time of a store record to the current timestamp.
 * 
 * @param {*} cacheID - The key of the store record to be refreshed.
 * 
 * @returns {boolean} 
 */
function hydrate(cacheID, lifespan = CACHE_DEFAULT_LIFESPAN_MINUTES) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        cacheFileContents[cacheID].expires = generateExpiryTimestamp(getCurrentTimeStamp(), lifespan * CACHE_LIFESPAN_MODIFIER);
        return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
    }
    return false;
}

/**
 * Sets a store record to expired, but does not delete it.
 * 
 * @param {string} cacheID
 *  
 * @returns {boolean} 
 */
function invalidate(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    if (cacheFileContents[cacheID]) {
        cacheFileContents[cacheID].expires = '-1';
        return writeCacheToFS(CACHE_FILE_PATH, cacheFileContents);
    }
    return false;
}

/**
 * Retrieves the expiry timestome for a given store record.
 * 
 * @param {string} cacheID 
 * 
 * @returns {BigInt} 
 */
function getExpiry(cacheID) {
    let cacheFileContents = readCacheFileContents(CACHE_FILE_PATH);
    return cacheFileContents[cacheID]?.expires || undefined;
}

/**
 * Sets the expiry timestamp for a given store record.
 * 
 * @param {string} cacheID 
 * @param {BigInt} timestamp
 *  
 * @returns {boolean} 
 */
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