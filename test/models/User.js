const test = require('ava');

const ModelFactory = require('../../src/models');

test('Must throw an error in case login is not defined', async t => {
    const stubStorage = {
        save() {},
    };
    const User = new ModelFactory(stubStorage).getModel('User');
    await t.throwsAsync(() => User.save({id: 'test'}));
});

test('Must throw an error in case id is not defined', async t => {
    const stubStorage = {
        save() {},
    };
    const User = new ModelFactory(stubStorage).getModel('User');
    await t.throwsAsync(() => User.save({login: 'test'}));
});
