const uuid = require('uuid');

const BaseModel = require('./BaseModel');
const expenseItem = require('./ExpenseItem');

module.exports = {
    init(storage) {
        const ExpenseItem = expenseItem.init(storage);
        return class Budget extends BaseModel.init(storage) {
            constructor(data) {
                super();

                this._id = data.id;
                this._name = data.name;
                this._total = data.total && parseInt(data.total) || 0;
                this._description = data.description;
                this._creationDate = data.creationDate;
                this._startDate = data.startDate;
                this._endDate = data.endDate;
                this._userID = data.userID;
            }

            static async findByUserID(userID) {
                return super.findWhere({userID});
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
                    startDate: this.startDate,
                    endDate: this.endDate,
                    userID: this.userID
                };
            }

            async free() {
                return this.total - (await this.getExpenseItemsTotal());
            }

            async allowed() {
                return this.total - (await this.getTransactionsTotal());
            }

            async getExpenseItemsTotal() {
                const items = await ExpenseItem.findByBudgetID(this.id);
                if (!items) {
                    return 0;
                }
                
                return items.reduce((sum, i) => sum + i.total, 0);
            }

            async getTransactionsTotal() {
                const items = await ExpenseItem.findByBudgetID(this.id);
                if (!items) {
                    return 0;
                }

                const transactionsTotal = await Promise.all(items.map(i => i.getTransactionsTotal()));
                return transactionsTotal.reduce((t1, t2) => t1 + t2);
            }

            async getTransactions() {
                const items = await ExpenseItem.findByBudgetID(this.id);
                const transactions = [];

                const itemTransactions = await Promise.all(items.map(i => i.getTransactions()));
                itemTransactions.forEach(t => transactions.push(...t));

                return transactions;
            }

            get id() {
                return this._id;
            }

            get name() {
                return this._name;
            }

            get total() {
                return this._total;
            }

            get description() {
                return this._description;
            }

            get creationDate() {
                return this._creationDate;
            }

            get startDate() {
                return this._startDate;
            }

            get endDate() {
                return this._endDate;
            }

            get userID() {
                return this._userID;
            }

            set name(val) {
                this._name = val;
            }

            set total(val) {
                this._total = val;
            }

            set description(val) {
                this._description = val;
            }

            set creationDate(val) {
                this._creationDate = val;
            }

            set startDate(val) {
                this._startDate = val;
            }

            set endDate(val) {
                this._endDate = val;
            }

            static get entityName() {
                return 'budget';
            }
        }
    }
};