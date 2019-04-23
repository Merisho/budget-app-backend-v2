const test = require('ava');

const ModelFactory = require('../../src/models');

let User;
let stubStorage;

test.beforeEach(() => {
    stubStorage = {
        save() {},
    };
    User = new ModelFactory(stubStorage).getModel('User');
});

test('Must throw an error in case password is not defined', async t => {
    await t.throwsAsync(() => User.save({login: 'test'}));
});

test('Must throw an error in case login is not defined', async t => {
    await t.throwsAsync(() => User.save({password: 'test'}));
});

test('Must hash the password on saving', async t => {
    stubStorage.save = () => {};

    const user = await User.save({
        password: 'test',
        login: 'test'
    });

    t.not(user.password, 'test');
});

test('Must generate UUID for user', async t => {
    stubStorage.save = () => {};

    const user = User.create({});

    const uuidLength = 36;
    t.is(user.id.length, uuidLength);
});
