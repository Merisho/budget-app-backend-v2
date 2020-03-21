const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLNonNull,
    GraphQLList
} = require('graphql');

const LongType = require('./LongType');

const appRegistry = require('../appRegistry');

const modelsFactory = appRegistry.get('models');

const ExpenseItemModel = modelsFactory.getModel('ExpenseItem');
const TransactionModel = modelsFactory.getModel('Transaction');

const ExpenseItemType = new GraphQLObjectType({
    name: 'ExpenseItem',
    fields() {
        const {TransactionType} = require('./TransactionSchema');
        
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            total: { type: LongType },
            description: { type: GraphQLString },
            creationDate: { type: GraphQLString },
            budgetID: { type: GraphQLID },
            transactionsTotal: {
                type: LongType,
                async resolve(parent, args) {
                    const expenseItem = await ExpenseItemModel.find(parent.id);
                    return expenseItem.getTransactionsTotal();
                }
            },
            transactions: {
                type: new GraphQLList(TransactionType),
                resolve(parent, args) {
                    return TransactionModel.findByExpenseItemID(parent.id);
                }
            }
        };
    }
});

const expenseItemQueries = {
    expenseItem: {
        type: ExpenseItemType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            return ExpenseItemModel.find(args.id)
        }
    }
};

const expenseItemMutations = {
    addExpenseItem: {
        type: ExpenseItemType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            total: { type: LongType },
            description: { type: GraphQLString },
            budgetID: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return ExpenseItemModel.save({
                name: args.name,
                total: args.total || 0,
                description: args.description,
                creationDate: new Date().toISOString(),
                budgetID: args.budgetID
            });
        }
    },

    updateExpenseItem: {
        type: ExpenseItemType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            total: { type: LongType },
            description: { type: GraphQLString }
        },
        async resolve(parent, args) {
            const expenseItem = await ExpenseItemModel.find(args.id);
            if (!expenseItem) {
                return null;
            }

            const fields = { ...args };
            delete fields.id;

            await expenseItem.setFields(fields).update();

            return expenseItem;
        }
    },

    deleteExpenseItem: {
        type: ExpenseItemType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return ExpenseItemModel.delete(args.id);
        }
    }
};

module.exports = {
    ExpenseItemType,
    expenseItemMutations,
    expenseItemQueries
};
