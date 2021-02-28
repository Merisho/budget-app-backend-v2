const {graphql} = require('graphql');

const config = require('./config');

const DynamoDB = require('./src/storages/DynamoDB');
const storage = new DynamoDB({
    tables: config.dynamo.entityTables,
    tableSuffix: process.env.NODE_ENV === 'production' ? config.dynamo.prodTableSuffix : ''
});

const ModelFactory = require('./src/models');
const modelFactory = new ModelFactory(storage);

const Cognito = require('./src/auth/Cognito');
const auth = new Cognito();

const appRegistry = require('./src/appRegistry');
appRegistry.set('models', modelFactory);
appRegistry.set('auth', auth);

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
        console.error(err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin' : '*'
            },
            body: 'Internal error',
        };
    }
};
