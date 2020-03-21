const http = require('http');
const {graphql} = require('graphql');

const config = require('./config');

const DynamoDB = require('./src/storages/DynamoDB');
const storage = new DynamoDB({
    tables: config.dynamo.entityTables,
    tableSuffix: process.env.NODE_ENV === 'production' ? config.dynamo.prodTableSuffix : '',
    dynamo: {
        accessKeyId: config.aws.keyId,
        secretAccessKey: config.aws.secret,
        region: config.aws.region
    }
});

const ModelFactory = require('./src/models');
const modelFactory = new ModelFactory(storage);

const Cognito = require('./src/auth/Cognito');
const auth = new Cognito({
    accessKeyId: config.aws.keyId,
    secretAccessKey: config.aws.secret,
    region: config.aws.region
});

const appRegistry = require('./src/appRegistry');
appRegistry.set('models', modelFactory);
appRegistry.set('auth', auth);

const graphqlSchema = require('./src/graphqlSchema');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify('Method Not Allowed'));
        return;
    }

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk.toString()));

    req.on('end', async () => {
        const body = chunks.join('');
        const result = await handleRequest(body);

        res.statusCode = result.statusCode;
        res.end(JSON.stringify(result.data));
    });
});

async function handleRequest(body) {
    try {
        const result = await graphql(graphqlSchema, body);
        if (result.errors) {
            console.error(JSON.stringify(result.errors));
            return {
                statusCode: 500,
                data: 'Internal error'
            };
        }

        return {
            statusCode: 200,
            data: result,
        };
    } catch(err) {
        console.error(err);
        return {
            statusCode: 500,
            data: 'Internal error',
        };
    }
}

const port = 3001;
server.listen(port, 'localhost', err => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Listening on', port);
});
