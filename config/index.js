module.exports = {
    aws: {
        keyId: process.AWS_ACCESS_KEY_ID,
        secret: process.AWS_SECRET_ACCESS_KEY,
        region: 'us-east-1',
    },
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