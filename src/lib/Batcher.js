module.exports = class Batcher {
    constructor(maxSize) {
        this._maxSize = maxSize;
        this._currBatch = [];
        this._batches = [this._currBatch];
    }

    push(elem) {
        this._currBatch.push(elem);

        if (this._currBatch.length % this._maxSize === 0) {
            this._currBatch = [];
            this._batches.push(this._currBatch);
        }

        return this;
    }

    all() {
        const all = [ ...this._batches ];
        const last = all.length - 1;
        
        if (all[last].length === 0) {
            all.pop();
        } else {
            all[last] = [ ...all[last] ];
        }

        return all;
    }
};