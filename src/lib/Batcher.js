module.exports = class Batcher {
    constructor(maxSize) {
        this._maxSize = maxSize;
        this._currBatch = [];
        this._batches = [this._currBatch];
    }

    push(elem) {
        this._currBatch.push(elem);

        if (this._currBatch.length === this._maxSize) {
            this._currBatch = [];
            this._batches.push(this._currBatch);
        }

        return this;
    }

    all() {
        const all = this._batchesDeepCopy();
        if (this._currBatch.length === 0) {
            all.pop();
        }

        return all;
    }

    _batchesDeepCopy() {
        return this._batches.map(b => [ ...b ]);
    }
};