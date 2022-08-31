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
const lifespan = 15 * 60 * 1000; // 15 minutes in milliseconds

satchel.write(cacheID, data, lifespan);

satchel.read('myVal'); // Hello, World!

// 15 minutes later

satchel.read('myVal'); // undefined
```