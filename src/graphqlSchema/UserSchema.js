const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const appRegistry = require('../appRegistry');

const modelsFactory = appRegistry.get('models');
const auth = appRegistry.get('auth');

const UserModel = modelsFactory.getModel('User');
const BudgetModel = modelsFactory.getModel('Budget');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields() {
        const {BudgetType} = require('./BudgetSchema');
        
        return {
            id: { type: GraphQLID },
            login: { type: GraphQLString },
            email: { type: GraphQLString },
            budgets: {
                type: new GraphQLList(BudgetType),
                async resolve(parent, args) {
                    const [own, shared] = await Promise.all([
                        BudgetModel.findByUserID(parent.id),
                        BudgetModel.findWhere({ collaborators: { contains: parent.id } })
                    ]);

                    return own.concat(shared);
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
    authUser: {
        type: UserType,
        args: {
            accessToken: { type: new GraphQLNonNull(GraphQLString) }
        },
        async resolve(parent, args) {
            let authData;
            try {
                authData = await auth.getUser(args.accessToken);
            } catch(err) {
                console.log(err);
                return null;
            }

            if (!authData.id) {
                throw new ReferenceError('User has no ID');
            }

            const user = await UserModel.find(authData.id);
            if (!user) {
                return await UserModel.save({
                    id: authData.id,
                    login: authData.username,
                    email: authData.email
                });
            }

            return user;
        }
    },

    addUser: {
        type: UserType,
        args: {
            login: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: GraphQLString }
        },
        resolve(parent, args) {
            return UserModel.save({
                login: args.login,
                email: args.email
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
