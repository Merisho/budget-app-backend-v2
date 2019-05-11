const dynamoDBUtils = require('../../src/storages/dynamoDBUtils');
const Batcher = require('../../src/lib/Batcher');

module.exports = class DynamoDBTestHelper {
    constructor(awsDynamoDB) {
        this._dynamo = awsDynamoDB;
    }

    putItem(table, item) {
        return this._dynamo.putItem({
            TableName: table,
            Item: dynamoDBUtils.dynamoItem(item)
        }).promise();
    }

    async truncateTable(table) {
        const res = await this._dynamo.scan({
            TableName: table
        }).promise();
        const itemIds = res.Items.map(i => dynamoDBUtils.entity(i).id);
    
        const maxAWSBatchSize = 25;
        const batcher = new Batcher(maxAWSBatchSize);
        itemIds.forEach(id => batcher.push(dynamoDBUtils.deleteRequest(id)));
    
        await Promise.all(batcher.all().map(b => {
            return this._dynamo.batchWriteItem({
                RequestItems: {
                    [table]: b
                }
            }).promise();
        }));
    }

    getItem(table, id) {
        return this._dynamo.query({
            ExpressionAttributeValues: {
                ':v1': {
                    S: id
                }
            },
            KeyConditionExpression: 'id = :v1',
            TableName: table
        }).promise();
    }
};