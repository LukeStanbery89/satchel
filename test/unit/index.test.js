'use strict';

const fs = require('fs');
const path = require('path');
const satchel = require('../../src/index');

const CACHE_FILE_PATH = path.join(process.cwd(), '/.satchel-cache/cache.json');
const NUMBER_AS_STRING_REGEX = /^[0-9]{1,20}$/;

describe('Index.js', () => {
    test('all() returns {} from empty cache file', () => {
        fs.__setMockFiles({});
        expect(satchel.all()).toStrictEqual({});
    });

    test('all() returns all records from populated cache file', () => {
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
        const result = satchel.all();
        expect(result).toStrictEqual(cacheContents);
    });

    test('write() creates a new cache record', () => {
        // Starts empty
        fs.__setMockFiles({});
        let cacheFile = fs.readFileSync(CACHE_FILE_PATH);
        expect(cacheFile).toBe(undefined);

        // Write test data
        satchel.write('test1', 'Foo');
        satchel.write('test2', 'Bar');

        // Validate
        cacheFile = JSON.parse(fs.readFileSync(CACHE_FILE_PATH));
        expect(cacheFile).toEqual(
            expect.objectContaining({
                test1: expect.objectContaining({
                    expires: expect.stringMatching(NUMBER_AS_STRING_REGEX),
                    data: 'Foo',
                }),
                test2: expect.objectContaining({
                    expires: expect.stringMatching(NUMBER_AS_STRING_REGEX),
                    data: 'Bar',
                }),
            })
        );
    });

    test('write() creates a new cache record when the cache file does not exist', () => {
        // Write test data
        satchel.write('test1', 'Foo');
        satchel.write('test2', 'Bar');

        // Validate
        const cacheFile = JSON.parse(fs.readFileSync(CACHE_FILE_PATH));
        expect(cacheFile).toEqual(
            expect.objectContaining({
                test1: expect.objectContaining({
                    expires: expect.stringMatching(NUMBER_AS_STRING_REGEX),
                    data: 'Foo',
                }),
                test2: expect.objectContaining({
                    expires: expect.stringMatching(NUMBER_AS_STRING_REGEX),
                    data: 'Bar',
                }),
            })
        );
    });

    test('read() returns a given cache store record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '999999999999999999999999',
                data: 'Foo',
            },
            key2: {
                expires: '999999999999999999999999',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Retrieve the cache store contents
        expect(satchel.read('key1')).toStrictEqual('Foo');
        expect(satchel.read('key2')).toStrictEqual('Bar');
    });

    test('read() does not return an expired cache store record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '-1',
                data: 'Foo',
            },
            key2: {
                expires: '-1',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Retrieve the cache store contents
        expect(satchel.read('key1')).toStrictEqual(undefined);
        expect(satchel.read('key2')).toStrictEqual(undefined);
    });

    test('read() returns undefined when the cache file does not exist', () => {
        // Retrieve the cache store contents
        expect(satchel.read('key1')).toStrictEqual(undefined);
    });

    test('remove() deletes a given cache store record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '999999999999999999999999',
                data: 'Foo',
            },
            key2: {
                expires: '999999999999999999999999',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Remove key1
        const result = satchel.remove('key1');

        // Validate
        expect(result).toBe(true);
        const cacheFile = fs.readFileSync(CACHE_FILE_PATH);
        expect(cacheFile).toBe('{"key2":{"expires":"999999999999999999999999","data":"Bar"}}');
    });

    test('remove() does nothing but return true when the record does not exist in the store', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '999999999999999999999999',
                data: 'Foo',
            },
            key2: {
                expires: '999999999999999999999999',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Remove key1
        const result = satchel.remove('key3');

        // Validate
        expect(result).toBe(true);
        const cacheFile = fs.readFileSync(CACHE_FILE_PATH);
        expect(cacheFile).toBe('{"key1":{"expires":"999999999999999999999999","data":"Foo"},"key2":{"expires":"999999999999999999999999","data":"Bar"}}');
    });

    test('remove() does nothing but return false when the cache file does not exist', () => {
        // Remove key1
        const result = satchel.remove('key1');

        // Validate
        expect(result).toBe(true);
    });

    test('hydrate() updates the expiry of the given record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '-1',
                data: 'Foo',
            },
            key2: {
                expires: '-1',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Hydrate the store record
        satchel.hydrate('key1');

        // Validate
        const cacheFile = JSON.parse(fs.readFileSync(CACHE_FILE_PATH));
        expect(parseInt(cacheFile.key1.expires)).toBeGreaterThan(-1);
        expect(parseInt(cacheFile.key2.expires)).toBe(-1);
    });

    test('hydrate() does nothing but return false when attempting to hydrate a non-existent store record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '-1',
                data: 'Foo',
            },
            key2: {
                expires: '-1',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Hydrate the store record
        const result = satchel.hydrate('key3');

        // Validate
        expect(result).toBe(false);
    });

    test('hydrate() does nothing but return false when the cache file does not exist', () => {
        const result = satchel.hydrate('key3');
        expect(result).toBe(false);
    });

    test('invalidate() expires a given record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '999999999999999999999999',
                data: 'Foo',
            },
            key2: {
                expires: '999999999999999999999999',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Hydrate the store record
        satchel.invalidate('key1');

        // Validate
        const cacheFile = JSON.parse(fs.readFileSync(CACHE_FILE_PATH));
        expect(cacheFile.key1.expires).toBe('-1');
        expect(parseInt(cacheFile.key2.expires)).toBeGreaterThan(-1);
    });

    test('invalidate() does nothing but return false when attempting to validate a non-existent store record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '999999999999999999999999',
                data: 'Foo',
            },
            key2: {
                expires: '999999999999999999999999',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Hydrate the store record
        const result = satchel.invalidate('key3');

        // Validate
        expect(result).toBe(false);
    });

    test('invalidate() does nothing but return false when the cache file does not exist', () => {
        const result = satchel.invalidate('key3');
        expect(result).toBe(false);
    });

    test('getExpiry() returns the expiry timestamp for a given record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '1234567890',
                data: 'Foo',
            },
            key2: {
                expires: '5555555555',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Validate
        expect(satchel.getExpiry('key1')).toBe('1234567890');
        expect(satchel.getExpiry('key2')).toBe('5555555555');
    });

    test('getExpiry() returns undefined for a non-existent record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '1234567890',
                data: 'Foo',
            },
            key2: {
                expires: '5555555555',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Validate
        expect(satchel.getExpiry('key3')).toBe(undefined);
    });

    test('getExpiry() returns undefined when the cache file does not exist', () => {
        const result = satchel.getExpiry('key3');
        expect(result).toBe(undefined);
    });

    test('setExpiry() sets the expiry for a given record', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '1234567890',
                data: 'Foo',
            },
            key2: {
                expires: '5555555555',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Update expiry
        satchel.setExpiry('key1', '3333333333');

        // Validate
        const cacheFile = JSON.parse(fs.readFileSync(CACHE_FILE_PATH));
        expect(cacheFile.key1.expires).toBe('3333333333');
        expect(cacheFile.key2.expires).toBe('5555555555');
    });

    test('setExpiry() does nothing but return false when the store record does not exist', () => {
        // Mock the cache contents
        const cacheContents = {
            key1: {
                expires: '1234567890',
                data: 'Foo',
            },
            key2: {
                expires: '5555555555',
                data: 'Bar',
            },
        };
        let mockfiles = {};
        mockfiles[CACHE_FILE_PATH] = JSON.stringify(cacheContents);
        fs.__setMockFiles(mockfiles);

        // Update expiry
        const result = satchel.setExpiry('key3', '3333333333');

        // Validate
        expect(result).toBe(false);
    });

    test('setExpiry() does nothing but return false when the cache file does not exist', () => {
        const result = satchel.setExpiry('key3', '3333333333');
        expect(result).toBe(false);
    });
});