const { GraphQLScalarType, Kind } = require('graphql');

module.exports = new GraphQLScalarType({
    name: 'Long',
    serialize(value) {
        return value.toString();
    },
    parseValue(value) {
        return +value;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return +ast.value;
        }

        return null;
    }
});
