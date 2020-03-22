const test = require('ava');
const AWS = require('aws-sdk');
const uuid = require('uuid');

const config = require('../../config');
const DynamoDBTestHelper = require('../../testLibs/DynamoDBTestHelper');
const DynamoDBStorage = require('../../../src/storages/DynamoDB');

if (!process.env.KEY || !process.env.SECRET || !process.env.REGION) {
    throw new Error('Environment variables like KEY, SECRET and REGION must be defined');
}

const dynamoHelper = new DynamoDBTestHelper(new AWS.DynamoDB({
    accessKeyId: process.env.KEY,
    secretAccessKey: process.env.SECRET,
    region: process.env.REGION
}));

const { testEntity } = config;
const testTable = config.tables[testEntity];

const customDynamo = new DynamoDBStorage({
    dynamo: {
        accessKeyId: process.env.KEY,
        secretAccessKey: process.env.SECRET,
        region: process.env.REGION
    },
    tables: config.tables
});

test.before(() => dynamoHelper.truncateTable(testTable));

test.after(() => dynamoHelper.truncateTable(testTable));

test('Must get item by ID', async t => {
    const id = uuid();
    await dynamoHelper.putItem(testTable, { id, testValue: 'test' });

    const item = await customDynamo.getByID(testEntity, id);

    t.truthy(item);
    t.is(item.testValue, 'test');
});

test('Must save item', async t => {
    const id = uuid();

    await customDynamo.save(testEntity, { id });

    const data = await dynamoHelper.getItem(testTable, id);
    t.is(data.Items.length, 1);
});

test('Must delete item by ID', async t => {
    const id = uuid();
    await dynamoHelper.putItem(testTable, { id, testValue: 'test' });

    await customDynamo.deleteByID(testEntity, id);

    const data = await dynamoHelper.getItem(testTable, id);
    t.is(data.Items.length, 0);
});

test('Must update a item by ID', async t => {
    const id = uuid();
    await dynamoHelper.putItem(testTable, { id, testValue: 'test' });

    await customDynamo.updateByID(testEntity, id, { testValue: 'updated' });

    const data = await dynamoHelper.getItem(testTable, id);
    t.is(data.Items[0].testValue.S, 'updated');
});

test('Must get items by simple condition', async t => {
    const uniqVal = uuid();
    await Promise.all([
        dynamoHelper.putItem(testTable, { id: uuid(), testValue: uniqVal }),
        dynamoHelper.putItem(testTable, { id: uuid(), testValue: uniqVal })
    ]);

    const items = await customDynamo.getByCondition(testEntity, { testValue: uniqVal });

    t.is(items.length, 2);
});

test('Must get items by "contains" condition', async t => {
    const neededId = uuid();
    await Promise.all([
        dynamoHelper.putItem(testTable, { id: uuid(), testCollection: [ 1, 2, 3, 4 ] }),
        dynamoHelper.putItem(testTable, { id: neededId, testCollection: [ 5, 6, 7 ] }),
    ]);

    const items = await customDynamo.getByCondition(testEntity, { testCollection: { contains: 6 } });

    t.is(items.length, 1);
    t.is(items[0].id, neededId);
});

test('Must get items by simple and "contains" conditions combined', async t => {
    const neededId = uuid();
    await Promise.all([
        dynamoHelper.putItem(testTable, { id: neededId, coll: [1, 2], attr: 'A' }),
        dynamoHelper.putItem(testTable, { id: uuid(), coll: [2, 3], attr: 'B' }),
        dynamoHelper.putItem(testTable, { id: uuid(), coll: [3, 4], attr: 'A' })
    ]);

    const items = await customDynamo.getByCondition(testEntity, { attr: 'A', coll: { contains: 2 } });

    t.is(items.length, 1);
    t.is(items[0].id, neededId);
});

test('Must delete items by condition and return deleted IDs', async t => {
    const id1 = uuid();
    const id2 = uuid();
    const uniqVal = uuid();
    await Promise.all([
        dynamoHelper.putItem(testTable, { id: id1, testValue: uniqVal }),
        dynamoHelper.putItem(testTable, { id: id2, testValue: uniqVal })
    ]);

    const deletedIds = await customDynamo.deleteByCondition(testEntity, { testValue: uniqVal });

    const [ data1, data2 ] = await Promise.all([
        dynamoHelper.getItem(testTable, id1),
        dynamoHelper.getItem(testTable, id2)
    ]);
    t.is(data1.Items.length, 0);
    t.is(data2.Items.length, 0);
    t.is(deletedIds.length, 2);
});

test('Must return empty array in case there are no items by given condition', async t => {
    const uniqVal = uuid();
    const deletedItemIds = await customDynamo.deleteByCondition(testEntity, { testValue: uniqVal });

    t.is(deletedItemIds.length, 0);
});
