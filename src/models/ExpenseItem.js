const uuid = require('uuid');

const BaseModel = require('./BaseModel');

module.exports = {
    init(storage) {
        return class Budget extends BaseModel.init(storage) {
            constructor(data) {
                super();

                this._id = data.id;
                this._name = data.name;
                this._total = data.total && parseInt(data.total) || 0;
                this._description = data.description;
                this._creationDate = data.creationDate;
                this._budgetID = data.budgetID;
            }

            static async findByBudgetID(budgetID) {
                return super.findWhere({budgetID});
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
                    budgetID: this.budgetID
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

            get budgetID() {
                return this._budgetID;
            }

            static get entityName() {
                return 'expenseItem';
            }
        }
    }
};