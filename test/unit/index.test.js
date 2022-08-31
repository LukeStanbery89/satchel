const { helloWorld } = require('../../src/index');

test('Hello, World!', () => {
    expect(helloWorld()).toBe('Hello, World!');
});