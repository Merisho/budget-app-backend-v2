const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList
} = require('graphql');

const {ExpenseItemType} = require('./ExpenseItemSchema');

const appRegistry = require('../appRegistry');

const modelsFactory = appRegistry.get('models');

const BudgetModel = modelsFactory.getModel('Budget');
const ExpenseItemModel = modelsFactory.getModel('ExpenseItem');

const BudgetType = new GraphQLObjectType({
    name: 'Budget',
    fields() {
        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            total: { type: GraphQLInt },
            description: { type: GraphQLString },
            creationDate: { type: GraphQLString },
            startDate: { type: GraphQLString },
            endDate: { type: GraphQLString },
            expenseItems: {
                type: new GraphQLList(ExpenseItemType),
                resolve(parent, args) {
                    return ExpenseItemModel.findByBudgetID(parent.id);
                }
            }
        };
    }
});

const budgetQueries = {
    budget: {
        type: BudgetType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            return BudgetModel.find(args.id)
        }
    }
};

const budgetMutations = {
    addBudget: {
        type: BudgetType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            total: { type: GraphQLInt },
            description: { type: GraphQLString },
            startDate: { type: new GraphQLNonNull(GraphQLString) },
            endDate: { type: new GraphQLNonNull(GraphQLString) },
            userID: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return BudgetModel.save({
                name: args.name,
                total: args.total || 0,
                description: args.description,
                creationDate: new Date().toISOString(),
                startDate: args.startDate,
                endDate: args.endDate,
                userID: args.userID
            });
        }
    },

    updateBudget: {
        type: BudgetType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            total: { type: GraphQLInt },
            description: { type: GraphQLString },
            startDate: { type: GraphQLString },
            endDate: { type: GraphQLString }
        },
        async resolve(parent, args) {
            const budget = await BudgetModel.find(args.id);
            if (!budget) {
                return null;
            }

            const fields = { ...args };
            delete fields.id;

            await budget.setFields(fields).update();

            return budget;
        }
    },

    deleteBudget: {
        type: BudgetType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return BudgetModel.delete(args.id);
        }
    }
};

module.exports = {
    BudgetType,
    budgetMutations,
    budgetQueries
};