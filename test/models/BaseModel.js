const test = require('ava');

const {init: baseModelInit} = require('../../src/models/BaseModel');

let TestBaseModel;
let stubStorage;

test.beforeEach(() => {
    stubStorage = {
        save() {},
    };

    const BaseModel = baseModelInit(stubStorage);
    TestBaseModel = class extends BaseModel {
        constructor(data) {
            super();
            this._name = data.name;
            this._testField = data.testField;
        }

        toJSON() {
            return {
                name: this._name
            };
        }

        get name() {
            return this._name;
        }

        set name(v) {
            this._name = v;
        }

        get testField() {
            return this._testField;
        }

        set testField(v) {
            this._testField = v;
        }

        static get entityName() {
            return 'testEntity';
        }
    };
});

test('Must find model entity by ID', async t => {
    let getCalled;
    let modelEntity;
    stubStorage.getByID = entity => {
        getCalled = true;
        modelEntity = entity;
        return Promise.resolve();
    };

    const m = await TestBaseModel.find('test-id');

    t.true(getCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});

test('Must delete model entity by ID', async t => {
    let deleteCalled;
    let modelEntity;
    stubStorage.deleteByID = entity => {
        deleteCalled = true;
        modelEntity = entity;
        return Promise.resolve();
    };

    await TestBaseModel.delete('test-id');

    t.true(deleteCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});

test('Must save model', async t => {
    let saveCalled = false;
    let modelEntity;
    stubStorage.save = entity => {
        saveCalled = true;
        modelEntity = entity;
        return Promise.resolve();
    };

    await TestBaseModel.save({
        name: 'test'
    });

    t.true(saveCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});

test('Must return model instance after saving', async t => {
    stubStorage.save = () => {};

    const model = await TestBaseModel.save({
        name: 'test'
    });

    t.true(model instanceof TestBaseModel);
});

test('Must update existing model entity', async t => {
    let updateCalled = false;
    let modelEntity;
    stubStorage.updateByID = entity => {
        updateCalled = true;
        modelEntity = entity;
        return Promise.resolve();
    };
    const model = new TestBaseModel({
        name: 'test'
    });

    await model.update({
        name: 'updated test'
    });

    t.true(updateCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});

test('Must find entities by condition', async t => {
    let findWhereCalled = false;
    let modelEntity;
    stubStorage.getByCondition = entity => {
        findWhereCalled = true;
        modelEntity = entity;
        return Promise.resolve([]);
    };

    await TestBaseModel.findWhere({ name: 'test' });

    t.true(findWhereCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});

test('Must set only defined properties which exist in the model and are not functions', async t => {
    const model = new TestBaseModel({
        name: 'test',
        testField: 'test'
    });

    model.setFields({
        name: 'updated',
        nonExisting: 'test',
        update: 'test'
    });

    t.is(model.name, 'updated');
    t.is(model.testField, 'test');
    t.is(model.nonExisting, undefined);
    t.not(model.update, 'test');
});

test('Must delete entities by condition', async t => {
    let modelEntity;
    let deleteByConditionCalled = false;
    stubStorage.deleteByCondition = (entity) => {
        modelEntity = entity;
        deleteByConditionCalled = true;
    };

    await TestBaseModel.deleteWhere({ expenseItemID: 'id' });

    t.true(deleteByConditionCalled);
    t.is(modelEntity, TestBaseModel.entityName);
});
