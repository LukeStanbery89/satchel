[![CodeQL](https://github.com/LukeStanbery89/satchel/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/LukeStanbery89/satchel/actions/workflows/codeql-analysis.yml)
[![Unit Tests](https://github.com/LukeStanbery89/satchel/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/LukeStanbery89/satchel/actions/workflows/unit-tests.yml)

# Satchel
Simple and lightweight package for caching data to a local key value store.

# Installation
Install using the follow command:

```
npm install @lukestanbery/satchel
```

# Usage
```javascript
const satchel = require('@lukestanbery/satchel');

const cacheID = 'myVal';
const data = 'Hello, World!';
const lifespan = 15; // lifespan in minutes

satchel.write(cacheID, data, lifespan);

satchel.read('myVal'); // Hello, World!

// 15 minutes later

satchel.read('myVal'); // undefined
```

Here is the full API:
```javascript
// Returns all records in the cache store
satchel.all();

// Logs a new record to the cache store. Lifespan arg is optional. Default lifespan is 15 minutes.
satchel.write(cacheID, data, lifespan);

// Reads a given record from the cache store
satchel.read(cacheID);

// Deletes a given record from the cache store
satchel.remove(cacheID);

// Refreshes the expiry time of a given cache store record. Lifespan arg is optional. Default lifespan is 15 minutes.
satchel.hydrate(cacheID, lifespan);

// Sets a given cache store record to expire right away, but does not delete it from the store.
satchel.invalidate(cacheID);

// Returns the expiry timestamp for a given cache store record.
satchel.getExpiry(cacheID);

// Manually sets the expiry timestamp for a given cache record.
satchel.setExpiry(cacheID, lifespan);
```