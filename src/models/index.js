const models = {
    User: require('./User'),
    Budget: require('./Budget'),
    ExpenseItem: require('./ExpenseItem'),
    Transaction: require('./Transaction')
};

module.exports = class ModelFactory {
    constructor(storage) {
        this._storage = storage;
    }

    getModel(name) {
        if (!models[name]) {
            return null;
        }

        return models[name].init(this._storage);
    }
};