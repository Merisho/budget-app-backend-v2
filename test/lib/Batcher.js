const test = require('ava');

const Batcher = require('../../src/lib/Batcher');

test('Must split all pushed data in batches of given size', t => {
    const maxSize = 5;
    const batcher = new Batcher(maxSize);

    const elements = 13;
    for (let i = 0; i < elements; i++) {
        batcher.push(i);
    }

    const expectedBatchesNum = 3;
    const batches = batcher.all();
    t.is(batches.length, expectedBatchesNum);
    t.deepEqual(batches[0], [0, 1, 2, 3, 4]);
    t.deepEqual(batches[1], [5, 6, 7, 8, 9]);
    t.deepEqual(batches[2], [10, 11, 12]);
});

test('Must return actual number of batches when number of elements is divisible by max batch size', t => {
    const maxSize = 5;
    const batcher = new Batcher(maxSize);

    const elements = 10;
    for (let i = 0; i < elements; i++) {
        batcher.push(i);
    }

    const expectedBatchesNum = 2;
    const batches = batcher.all();
    t.is(batches.length, expectedBatchesNum);
});
