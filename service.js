const {graphql} = require('graphql');

const DynamoDB = require('./src/storages/DynamoDB');
const storage = new DynamoDB();

const ModelFactory = require('./src/models');
const modelFactory = new ModelFactory(storage);

const appRegistry = require('./src/appRegistry');
appRegistry.set('models', modelFactory);

const graphqlSchema = require('./src/graphqlSchema');

module.exports.api = async (event, context) => {
    try {
        const result = await graphql(graphqlSchema, event.body);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin' : '*'
            },
            body: JSON.stringify(result),
        };
    } catch(err) {
        console.log(err);
        return {
            statusCode: 500,
            body: 'Internal error',
        };
    }
};
