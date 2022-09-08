'use strict';

const path = require('path');

const fs = jest.createMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
    mockFiles = Object.create(null);
    for (const file in newMockFiles) {
        mockFiles[file] = newMockFiles[file];
    }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(filePath) {
    return mockFiles[filePath] || [];
}

function mkdirSync(filePath) {
    if (!existsSync(filePath)) {
        mockFiles[filePath] = [];
        return true;
    }
    return true;
}

function existsSync(filePath) {
    return mockFiles[filePath] !== undefined;
}

function writeFileSync(filePath, data) {
    return mockFiles[filePath] = data;
}

function readFileSync(filePath) {
    return mockFiles[filePath];
}

fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.mkdirSync = mkdirSync;
fs.existsSync = existsSync;
fs.writeFileSync = writeFileSync;
fs.readFileSync = readFileSync;

module.exports = fs;