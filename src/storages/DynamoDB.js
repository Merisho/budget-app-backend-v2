const AWS = require('aws-sdk');

const dynamoUtils = require('./dynamoDBUtils');
const Batcher = require('../lib/Batcher');

module.exports = class DynamoDB {
    constructor(params = {}) {
        if (!params.tables) {
            throw new Error('Entity tables must be defined');
        }

        this._awsDynamo = new AWS.DynamoDB(params.dynamo);
        this._tableSuffix = params.tableSuffix || '';
        this._tables = params.tables;
    }

    getByID(entityName, id) {
        const table = this._resolveTable(entityName);

        return this._awsDynamo.query({
            ExpressionAttributeValues: {
                ':v1': {
                    S: id
                }
            },
            KeyConditionExpression: 'id = :v1',
            TableName: table
        }).promise().then(data => dynamoUtils.entity(data.Items[0]));
    }

    save(entityName, data) {
        const table = this._resolveTable(entityName);

        const item = dynamoUtils.dynamoItem(data);
        return this._awsDynamo.putItem({
            Item: item,
            TableName: table
        }).promise();
    }

    deleteByID(entityName, id) {
        const table = this._resolveTable(entityName);

        return this._awsDynamo.deleteItem({
            Key: {
                id: dynamoUtils.dynamoValue(id)
            },
            TableName: table
        }).promise();
    }

    async deleteByCondition(entityName, condition) {
        const table = this._resolveTable(entityName);

        const maxAWSBatchSize = 25;
        const batcher = new Batcher(maxAWSBatchSize);
        const items = await this.getByCondition(entityName, condition);
        const itemIds = items.map(i => i.id);
        itemIds.forEach(id => batcher.push(dynamoUtils.deleteRequest(id)));

        return Promise.all(batcher.all().map(b => {
            return this._awsDynamo.batchWriteItem({
                RequestItems: {
                    [table]: b
                }
            }).promise();
        })).then(() => itemIds);
    }

    updateByID(entityName, id, data) {
        const table = this._resolveTable(entityName);

        const attrNames = dynamoUtils.expressionAttributeNames(data);
        const attrVals = dynamoUtils.expressionAttributeValues(data);
        const updateExpression = dynamoUtils.updateExpression('SET', data);

        return this._awsDynamo.updateItem({
            Key: {
                id: dynamoUtils.dynamoValue(id)
            },
            ExpressionAttributeNames: attrNames,
            ExpressionAttributeValues: attrVals,
            UpdateExpression: updateExpression,
            TableName: table
        }).promise();
    }

    getByCondition(entityName, condition) {
        const table = this._resolveTable(entityName);

        const attrVals = this._attributeValuesFromCondition(condition);
        const exprAttrVals = dynamoUtils.expressionAttributeValues(attrVals);
        const filterExp = dynamoUtils.filterExpression(condition);

        return this._awsDynamo.scan({
            ExpressionAttributeValues: exprAttrVals,
            FilterExpression: filterExp,
            TableName: table
        }).promise().then(data => data.Items.map(dynamoUtils.entity));
    }

    _resolveTable(entity) {
        let tableName = this._tables[entity];
        if (!tableName) {
            throw new Error(`Invalid entity name ${entity}: no table for the given entity`);
        }

        return tableName + this._tableSuffix;
    }

    _attributeValuesFromCondition(condition) {
        const attrVals = {};
        Object.keys(condition).forEach(k => {
            const cond = condition[k];
            if (cond.contains) {
                attrVals[k] = cond.contains;
            } else {
                attrVals[k] = cond;
            }
        });

        return attrVals;
    }
};