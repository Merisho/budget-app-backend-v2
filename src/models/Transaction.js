const uuid = require('uuid');

const BaseModel = require('./BaseModel');

module.exports = {
    init(storage) {
        return class Transaction extends BaseModel.init(storage) {
            constructor(data) {
                super();

                this._id = data.id;
                this._name = data.name;
                this._total = data.total && parseInt(data.total) || 0;
                this._description = data.description;
                this._creationDate = data.creationDate;
                this._expenseItemID = data.expenseItemID;
            }

            static async findByExpenseItemID(expenseItemID) {
                return super.findWhere({expenseItemID});
            }

            static create(data) {
                return super.create({
                    ...data,
                    id: uuid()
                });
            }

            toJSON() {
                return {
                    id: this.id,
                    name: this.name,
                    total: this.total,
                    description: this.description,
                    creationDate: this.creationDate,
                    expenseItemID: this.expenseItemID
                };
            }

            get id() {
                return this._id;
            }

            get name() {
                return this._name;
            }

            set name(val) {
                this._name = val;
            }

            get total() {
                return this._total;
            }

            set total(val) {
                this._total = val;
            }

            get description() {
                return this._description;
            }

            set description(val) {
                this._description = val;
            }

            get creationDate() {
                return this._creationDate;
            }

            set creationDate(val) {
                this._creationDate = val;
            }

            get expenseItemID() {
                return this._expenseItemID;
            }

            static get entityName() {
                return 'transaction';
            }
        }
    }
};