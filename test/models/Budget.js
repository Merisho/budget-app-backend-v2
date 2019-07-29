const test = require('ava');
const sinon = require('sinon');

const ModelFactory = require('../../src/models');

test('Must return expense items total', async t => {
    const storage = {
        getByCondition() {
            return [
                { name: 'expense item 1', total: 30 },
                { name: 'expense item 2', total: 30 },
                { name: 'expense item 3', total: 40 }
            ];
        }
    };
    
    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({});

    t.is(await budget.getExpenseItemsTotal(), 100);
});

test('Must return transactions total', async t => {
    const storage = {
        getByCondition(entityName) {
            if (entityName === 'expenseItem') {
                return [
                    { name: 'expense item 1', total: 100 }
                ];
            } else if (entityName === 'transaction') {
                return [
                    { name: 'transaction 1', total: 10 },
                    { name: 'transaction 2', total: 20 },
                    { name: 'transaction 2', total: 30 },
                ];
            }
        }
    };
    
    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({});

    t.is(await budget.getTransactionsTotal(), 60);
});

test('Must get all transactions', async t => {
    const storage = {
        getByCondition(entityName) {
            if (entityName === 'expenseItem') {
                return [
                    { name: 'expense item 1' }
                ];
            } else if (entityName === 'transaction') {
                return [
                    { name: 'transaction 1' },
                    { name: 'transaction 2' },
                    { name: 'transaction 2' },
                ];
            }
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({});

    const transactions = await budget.getTransactions();

    t.is(transactions.length, 3);
});

test('Must return allowed same as total if no expense items defined', async t => {
    const storage = {
        getByCondition() {
            return [];
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({
        total: 1000
    });

    t.is(await budget.allowed(), 1000);
});

test('Must return allowed same as total if no transactions commited', async t => {
    const storage = {
        getByCondition(entityName) {
            if (entityName === 'expenseItem') {
                return [{ name: 'expense item', total: 100 }];
            } else if (entityName === 'transaction') {
                return [];
            }
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({
        total: 1000
    });

    t.is(await budget.allowed(), 1000);
});

test('Must return free same as total if no expense items defined', async t => {
    const storage = {
        getByCondition() {
            return [];
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    const budget = new Budget({
        total: 1000
    });

    t.is(await budget.free(), 1000);
});

test('Must delete child expense item when the budget is deleted', async t => {
    const storage = {
        deleteByCondition: sinon.spy(),
        deleteByID() {},
        getByCondition() {
            return [{ id: 'expense-item' }];
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    await Budget.delete('id');

    t.true(storage.deleteByCondition.called);
    t.true(storage.deleteByCondition.calledWith('expenseItem'));
});

test('Must delete child expense items before the actual budget', async t => {
    const storage = {
        deleteByCondition: sinon.spy(),
        deleteByID: sinon.spy(),
        getByCondition() {
            return [{ id: 'expense-item' }];
        }
    };

    const Budget = new ModelFactory(storage).getModel('Budget');
    await Budget.delete('id');

    t.true(storage.deleteByCondition.calledWith('expenseItem'));
    t.true(storage.deleteByCondition.calledBefore(storage.deleteByID));
    t.true(storage.deleteByID.firstCall.calledWith('budget'));
});
