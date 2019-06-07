const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull
} = require('graphql');

const appRegistry = require('../appRegistry');
const LongType = require('./LongType');

const modelsFactory = appRegistry.get('models');

const TransactionModel = modelsFactory.getModel('Transaction');

const TransactionType = new GraphQLObjectType({
    name: 'Transaction',
    fields() {
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            total: { type: LongType },
            description: { type: GraphQLString },
            creationDate: { type: GraphQLString }
        };
    }
});

const transactionQueries = {};

const transactionMutations = {
    addTransaction: {
        type: TransactionType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            total: { type: LongType },
            description: { type: GraphQLString },
            expenseItemID: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return TransactionModel.save({
                name: args.name,
                total: args.total || 0,
                description: args.description,
                creationDate: new Date().toISOString(),
                expenseItemID: args.expenseItemID
            });
        }
    },

    updateTransaction: {
        type: TransactionType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            total: { type: LongType },
            description: { type: GraphQLString }
        },
        async resolve(parent, args) {
            const transaction = await TransactionModel.find(args.id);
            if (!transaction) {
                return null;
            }

            const fields = { ...args };
            delete fields.id;

            await transaction.setFields(fields).update();

            return transaction;
        }
    },

    deleteTransaction: {
        type: TransactionType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return TransactionModel.delete(args.id);
        }
    }
};

module.exports = {
    TransactionType,
    transactionMutations,
    transactionQueries
};
