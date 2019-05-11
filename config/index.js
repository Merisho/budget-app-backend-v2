module.exports = {
    dynamo: {
        entityTables: {
            user: 'BudgetApp-Users',
            budget: 'BudgetApp-Budgets',
            expenseItem: 'BudgetApp-ExpenseItems',
            transaction: 'BudgetApp-Transactions'
        },
        prodTableSuffix: '-PROD'
    }
};