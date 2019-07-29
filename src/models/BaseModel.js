module.exports = {
    init(storage) {
        return class BaseModel {
            static async find(id) {
                const data = await storage.getByID(this.entityName, id);
                return data ? new this(data) : null;
            }

            static async findWhere(condition) {
                const entities = await storage.getByCondition(this.entityName, condition);
                return entities.length ? entities.map(e => new this(e)) : null;
            }

            static async delete(id) {
                await storage.deleteByID(this.entityName, id);
            }

            static deleteWhere(condition) {
                return storage.deleteByCondition(this.entityName, condition);
            }

            static async save(data) {
                const model = this.create(data);
                await storage.save(this.entityName, model.toJSON());
        
                return model;
            }

            static create(data) {
                return new this(data);
            }

            async update() {
                const data = this.toJSON();
                delete data.id;
        
                await storage.updateByID(this.constructor.entityName, this.id, data);
            }

            setFields(fields) {
                for (const f in fields) {
                    if (f in this && typeof this[f] !== 'function' && typeof fields[f] !== 'undefined') {
                        this[f] = fields[f];
                    }
                }

                return this;
            }

            async sync() {
                const fresh = await this.constructor.find(this.id);
                if (!fresh) {
                    return;
                }

                for (const p in fresh) {
                    if (p.startsWith('_') && typeof this[p] !== 'function') {
                        this[p] = fresh[p];
                    }
                }
            }

            static get entityName() {
                throw new TypeError('entityName must be defined in a child class');
            }
        };
    }
};