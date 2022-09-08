'use strict';

const fs = require('fs');
const path = require('path');
const { readCacheFileContents } = require('../../src/file-utils');

const CACHE_FILE_PATH = path.join(process.cwd(), '/.satchel-cache/cache.json');

describe('File Utils', () => {
    test('readCacheFileContents() retrieves the contents from a file', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '1234567890',
                data: 'Foo',
            },
            key2: {
                expires: '2345678901',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Retrieve the cache store contents
        const result = readCacheFileContents(CACHE_FILE_PATH);
        expect(result).toStrictEqual(cacheContents);
    });

    test('readCacheFileContents() returns {} when the cache file is empty', () => {
        // Mock the cache contents
        fs.__setMockFiles({});

        // Retrieve the cache store contents
        const result = readCacheFileContents(CACHE_FILE_PATH);
        expect(result).toStrictEqual({});
    });

    test('readCacheFileContents() returns {} when the cache file does not exist', () => {
        // Retrieve the cache store contents
        const result = readCacheFileContents('THIS_DOES_NOT_EXIST');
        expect(result).toStrictEqual({});
    });
});