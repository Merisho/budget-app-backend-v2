const test = require('ava');

const dynamoUtils = require('../../src/storages/dynamoDBUtils');

test('Must build expression attribute names from data object', t => {
    const data = {
        a: '1',
        b: '2',
        c: '3'
    };

    const expAttrNames = dynamoUtils.expressionAttributeNames(data);

    t.is(expAttrNames['#A'], 'a');
    t.is(expAttrNames['#B'], 'b');
    t.is(expAttrNames['#C'], 'c');
});

test('Must build expression attribute values from data object', t => {
    const data = {
        a: '1',
        b: 2,
        c: true,
    };

    const expAttrValues = dynamoUtils.expressionAttributeValues(data);

    t.is(expAttrValues[':a'].S, '1');
    t.is(expAttrValues[':b'].N, '2');
    t.is(expAttrValues[':c'].BOOL, true);
});

test('Must return update expression for given data object', t => {
    const data = {
        a: '1',
        b: 2,
        c: true
    };

    const updateExp = dynamoUtils.updateExpression('SET', data);

    t.is(updateExp, 'SET #A = :a, #B = :b, #C = :c');
});

test('Must return DynamoDB typed attribute value', t => {
    const str = 'string';
    const num = 3.14;
    const bool = true;
    const date = new Date(0);
    const obj = { test: 'test' };
    const undef = undefined;
    const strArr = [ 'test', 'str' ];
    const numArr = [ 1, 2, 3 ];

    const strAttr = dynamoUtils.dynamoValue(str);
    const numAttr = dynamoUtils.dynamoValue(num);
    const boolAttr = dynamoUtils.dynamoValue(bool);
    const dateAttr = dynamoUtils.dynamoValue(date);
    const objAttr = dynamoUtils.dynamoValue(obj);
    const undefAttr = dynamoUtils.dynamoValue(undef);
    const strArrAttr = dynamoUtils.dynamoValue(strArr);
    const numArrAttr = dynamoUtils.dynamoValue(numArr);

    t.is(strAttr.S, str);
    t.is(numAttr.N, num.toString());
    t.is(boolAttr.BOOL, bool);
    t.is(dateAttr.S, date.toISOString());
    t.is(objAttr.S, JSON.stringify(obj));
    t.is(undefAttr, undefined);
    t.deepEqual(strArrAttr.SS, strArr);
    t.deepEqual(numArrAttr.NS, numArr.map(n => n.toString()));
});

test('Must build FilterExpression', t => {
    const filter = {
        attr1: 'val1',
        attr2: 'val2',
        attr3: {
            contains: 'val3',
        },
    };

    const filterExpression = dynamoUtils.filterExpression(filter);

    t.is(filterExpression, 'attr1 = :attr1 and attr2 = :attr2 and contains(attr3, :attr3)');
});

test('Must build DeleteRequest for BatchWriteItem', t => {
    const id = 'test';

    const deleteReq = dynamoUtils.deleteRequest(id);

    t.deepEqual(deleteReq, {
        DeleteRequest: {
            Key: {
                id: {
                    S: 'test'
                }
            }
        }
    });
});
