const AWS = require('aws-sdk');

const dynamoUtils = require('./dynamoDBUtils');

module.exports = class DynamoDB {
    constructor(params) {
        this._awsDynamo = new AWS.DynamoDB(params);
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

        const attrVals = dynamoUtils.expressionAttributeValues(condition);
        const filterExp = dynamoUtils.filterExpression(condition);

        return this._awsDynamo.scan({
            ExpressionAttributeValues: attrVals,
            FilterExpression: filterExp,
            TableName: table
        }).promise().then(data => data.Items.map(dynamoUtils.entity));
    }

    _resolveTable(entity) {
        if (entity === 'user') {
            return 'BudgetApp-Users';
        } else if (entity === 'budget') {
            return 'BudgetApp-Budgets';
        } else if (entity === 'expenseItem') {
            return 'BudgetApp-ExpenseItems';
        } else if (entity === 'transaction') {
            return 'BudgetApp-Transactions';
        }

        throw new Error(`Invalid entity name ${entity}: no table for the given entity`);
    }
};