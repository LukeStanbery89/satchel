function cacheRecordIsStale(cacheRecord) {
    return getCurrentTimeStamp() >= cacheRecord.expires;
}

function removeCacheRecord(cacheFileContents, cacheID) {
    delete cacheFileContents[cacheID];
    return cacheFileContents;
}

function getCurrentTimeStamp() {
    return Math.floor(new Date().getTime() / 1000).toString();
}

function generateExpiryTimestamp(currentTimestamp, cacheLifespan) {
    const t = BigInt(currentTimestamp);
    const l = BigInt(cacheLifespan);
    return (t + l).toString();
}

module.exports = {
    cacheRecordIsStale,
    removeCacheRecord,
    getCurrentTimeStamp,
    generateExpiryTimestamp,
};