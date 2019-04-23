const {
    GraphQLObjectType,
    GraphQLSchema,
} = require('graphql');

const {userQueries, userMutations} = require('./UserSchema');
const {budgetQueries, budgetMutations} = require('./BudgetSchema');
const {expenseItemMutations} = require('./ExpenseItemSchema');
const {transactionMutations} = require('./TransactionSchema');

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        ...userQueries,
        ...budgetQueries
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