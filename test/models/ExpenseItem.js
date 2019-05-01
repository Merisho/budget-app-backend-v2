const test = require('ava');

const ModelFactory = require('../../src/models');

test('Must return total of all transactions', async t => {
    const stubStorage = {
        getByCondition() {
            return [
                { name: 'transaction 1', total: 30 },
                { name: 'transaction 2', total: 30 },
                { name: 'transaction 3', total: 40 }
            ];
        }
    };
    const ExpenseItem = new ModelFactory(stubStorage).getModel('ExpenseItem');
    const expenseItem = new ExpenseItem({});

    t.is(await expenseItem.getTransactionsTotal(), 100);
});

test('Must return all transactions', async t => {
    const stubStorage = {
        getByCondition() {
            return [
                { name: 'transaction 1', total: 30 },
                { name: 'transaction 2', total: 30 },
                { name: 'transaction 3', total: 40 }
            ];
        }
    };

    const ExpenseItem = new ModelFactory(stubStorage).getModel('ExpenseItem');
    const expenseItem = new ExpenseItem({});

    const transactions = await expenseItem.getTransactions();

    t.is(transactions.length, 3);
});