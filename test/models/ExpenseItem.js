const test = require('ava');
const sinon = require('sinon');

const ModelFactory = require('../../src/models');

test('Must return total of all transactions', async t => {
    const storage = {
        getByCondition() {
            return [
                { name: 'transaction 1', total: 30 },
                { name: 'transaction 2', total: 30 },
                { name: 'transaction 3', total: 40 }
            ];
        }
    };
    const ExpenseItem = new ModelFactory(storage).getModel('ExpenseItem');
    const expenseItem = new ExpenseItem({});

    t.is(await expenseItem.getTransactionsTotal(), 100);
});

test('Must return all transactions', async t => {
    const storage = {
        getByCondition() {
            return [
                { name: 'transaction 1', total: 30 },
                { name: 'transaction 2', total: 30 },
                { name: 'transaction 3', total: 40 }
            ];
        }
    };

    const ExpenseItem = new ModelFactory(storage).getModel('ExpenseItem');
    const expenseItem = new ExpenseItem({});

    const transactions = await expenseItem.getTransactions();

    t.is(transactions.length, 3);
});

test('Must delete child transactions when expense item is to be deleted', async t => {
    const storage = {
        deleteByCondition: sinon.spy(),
        deleteByID() {}
    };

    const ExpenseItem = new ModelFactory(storage).getModel('ExpenseItem');
    await ExpenseItem.delete('id');

    t.true(storage.deleteByCondition.calledOnce);
    t.true(storage.deleteByCondition.calledWith('transaction'));
});

test('Must delete child transactions before the actual expense item', async t => {
    const storage = {
        deleteByCondition: sinon.spy(),
        deleteByID: sinon.spy()
    };

    const ExpenseItem = new ModelFactory(storage).getModel('ExpenseItem');
    await ExpenseItem.delete('id');

    const { deleteByCondition } = storage;

    t.true(deleteByCondition.firstCall.calledWith('transaction'));
    t.true(deleteByCondition.calledBefore(storage.deleteByID));
    t.true(storage.deleteByID.firstCall.calledWith('expenseItem'));
});

test('Must delete child transactions first when expense item is deleted by condition', async t => {
    const storage = {
        deleteByCondition: sinon.spy(),
        getByCondition() {
            return [{ id: 'entity1' }, { id: 'entity2' }];
        }
    };

    const ExpenseItem = new ModelFactory(storage).getModel('ExpenseItem');
    await ExpenseItem.deleteWhere({ budgetID: 'id' });

    t.true(storage.deleteByCondition.firstCall.calledWith('transaction'));
    t.true(storage.deleteByCondition.secondCall.calledWith('transaction'));
    t.true(storage.deleteByCondition.thirdCall.calledWith('expenseItem'));
});