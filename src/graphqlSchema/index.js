const {
    GraphQLObjectType,
    GraphQLSchema,
} = require('graphql');

const appRegistry = require('../appRegistry');
if (!appRegistry.get('models')) {
    throw new Error('AppRegistry must contain models factory');
}

const {userQueries, userMutations} = require('./UserSchema');
const {budgetQueries, budgetMutations} = require('./BudgetSchema');
const {expenseItemQueries, expenseItemMutations} = require('./ExpenseItemSchema');
const {transactionQueries, transactionMutations} = require('./TransactionSchema');

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        ...userQueries,
        ...budgetQueries,
        ...expenseItemQueries,
        ...transactionQueries
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...userMutations,
        ...budgetMutations,
        ...expenseItemMutations,
        ...transactionMutations
    }
});

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation
});