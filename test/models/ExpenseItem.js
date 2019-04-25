const test = require('ava');

const ModelFactory = require('../../src/models');

let ExpenseItem;
let stubStorage;

test.beforeEach(() => {
  ExpenseItem = new ModelFactory(stubStorage).getModel('ExpenseItem');
});

test('Must return summary total of all transactions', async t => {
  const stubStorage = {
    getByCondition() {
      return [
        {
          name: 'transaction 1',
          total: 30
        },
        {
          name: 'transaction 2',
          total: 30
        },
        {
          name: 'transaction 3',
          total: 40
        }
      ];
    }
  };
  const ExpenseItem = new ModelFactory(stubStorage).getModel('ExpenseItem');
  const expenseItem = new ExpenseItem({});

  t.is(await expenseItem.getTransactionsTotal(), 100);
});