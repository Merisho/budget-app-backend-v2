const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList
} = require('graphql');

const {TransactionType} = require('./TransactionSchema');

const appRegistry = require('../appRegistry');

const modelsFactory = appRegistry.get('models');

const ExpenseItemModel = modelsFactory.getModel('ExpenseItem');
const TransactionModel = modelsFactory.getModel('Transaction');

const ExpenseItemType = new GraphQLObjectType({
    name: 'ExpenseItem',
    fields() {
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            total: { type: GraphQLInt },
            description: { type: GraphQLString },
            creationDate: { type: GraphQLString },
            transactions: {
                type: new GraphQLList(TransactionType),
                resolve(parent, args) {
                    return TransactionModel.findByExpenseItemID(parent.id);
                }
            }
        };
    }
});

const expenseItemMutations = {
    addExpenseItem: {
        type: ExpenseItemType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            total: { type: GraphQLInt },
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
            total: { type: GraphQLInt },
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
    expenseItemMutations
};