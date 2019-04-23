const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const appRegistry = require('../appRegistry');

const modelsFactory = appRegistry.get('models');

const UserModel = modelsFactory.getModel('User');
const BudgetModel = modelsFactory.getModel('Budget');

const {BudgetType} = require('./BudgetSchema');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields() {
        return {
            id: { type: GraphQLID },
            login: { type: GraphQLString },
            email: { type: GraphQLString },
            password: { type: GraphQLString },
            budgets: {
                type: new GraphQLList(BudgetType),
                resolve(parent, args) {
                    return BudgetModel.findByUserID(parent.id);
                }
            }
        };
    }
});

const userQueries = {
    user: {
        type: UserType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            return UserModel.find(args.id)
        }
    }
};

const userMutations = {
    addUser: {
        type: UserType,
        args: {
            login: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: GraphQLString },
            password: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve(parent, args) {
            return UserModel.save({
                login: args.login,
                email: args.email,
                password: args.password
            });
        }
    },

    deleteUser: {
        type: UserType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return UserModel.delete(args.id);
        }
    },

    updateUser: {
        type: UserType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            login: { type: GraphQLString },
            email: { type: GraphQLString }
        },
        async resolve(parent, args) {
            const user = await UserModel.find(args.id);
            if (!user) {
                return null;
            }
            
            const fields = { ...args };
            delete fields.id;

            await user.setFields(fields).update();
            
            return user;
        }
    }
};

module.exports = {
    UserType,
    userQueries,
    userMutations
};