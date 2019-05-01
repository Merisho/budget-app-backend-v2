const test = require('ava');

const ModelFactory = require('../../src/models');

test('Must return expense items total', async t => {
    const stubStorage = {
        getByCondition() {
            return [
                { name: 'expense item 1', total: 30 },
                { name: 'expense item 2', total: 30 },
                { name: 'expense item 3', total: 40 }
            ];
        }
    };
    
    const Budget = new ModelFactory(stubStorage).getModel('Budget');
    const budget = new Budget({});

    t.is(await budget.getExpenseItemsTotal(), 100);
});

test('Must return transactions total', async t => {
    const stubStorage = {
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
    
    const Budget = new ModelFactory(stubStorage).getModel('Budget');
    const budget = new Budget({});

    t.is(await budget.getTransactionsTotal(), 60);
});

test('Must get all transactions', async t => {
    const stubStorage = {
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

    const Budget = new ModelFactory(stubStorage).getModel('Budget');
    const budget = new Budget({});

    const transactions = await budget.getTransactions();

    t.is(transactions.length, 3);
});