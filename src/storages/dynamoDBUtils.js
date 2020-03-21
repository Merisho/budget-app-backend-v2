const dynamoDBTypes = {
    'string': 'S',
    'number': 'N',
    'boolean': 'BOOL'
};

module.exports = {
    expressionAttributeNames(data) {
        const attrs = {};
        Object.keys(data).forEach(k => {
            if (typeof data[k] === 'undefined') {
                return;
            }

            const key = this._expAttrNameKey(k);
            attrs[key] = k;
        });

        return attrs;
    },

    expressionAttributeValues(data) {
        const vals = {};
        Object.keys(data).forEach(k => {
            if (typeof data[k] === 'undefined') {
                return;
            }

            const key = this._expAttrValueKey(k);
            vals[key] = this.dynamoValue(data[k]);
        });

        return vals;
    },

    updateExpression(action, data) {
        let exp = action + ' ';
        const keys = [];

        Object.keys(data).forEach(k => {
            if (typeof data[k] === 'undefined') {
                return;
            }
            
            const attrNameKey = this._expAttrNameKey(k);
            const attrValKey = this._expAttrValueKey(k);
            keys.push(`${attrNameKey} = ${attrValKey}`);
        });

        return exp + keys.join(', ');
    },

    dynamoItem(data) {
        const item = {};
        Object.keys(data).forEach(k => {
            const val = this.dynamoValue(data[k]);
            val && (item[k] = val);
        });

        return item;
    },

    entity(dynamoItem) {
        if (!dynamoItem) {
            return null;
        }

        const entity = {};
        Object.keys(dynamoItem).forEach(k => {
            const valKey = Object.keys(dynamoItem[k])[0];
            entity[k] = dynamoItem[k][valKey];
        });

        return entity;
    },

    deleteRequest(id) {
        const idVal = this.dynamoValue(id);

        return {
            DeleteRequest: {
                Key: {
                    id: { ...idVal }
                }
            }
        };
    },

    dynamoValue(val) {
        if (val === null) {
            return {
                NULL: true
            };
        }

        const type = typeof val;
        if (type === 'undefined') {
            return val;
        }

        if (type === 'object') {
            if (val instanceof Date) {
                return { S: val.toISOString() };
            } else if (val instanceof Array) {
                if (typeof val[0] === 'number') {
                    return { NS: val.map(n => n.toString()) };
                }

                return { SS: [ ...val ] };
            }

            return { S: JSON.stringify(val) };
        }

        const dynamoType = dynamoDBTypes[type];
        if (!dynamoType) {
            return { S: val + '' };
        }

        const v = type === 'boolean' ? val : val.toString();

        return { [dynamoType]: v };
    },

    filterExpression(filter) {
        const filterExp = [];

        Object.keys(filter).forEach(k => {
            const attrValueAlias = this._expAttrValueKey(k);

            if (filter[k].contains) {
                filterExp.push(`contains(${k}, ${attrValueAlias})`);
            } else {
                filterExp.push(`${k} = ${attrValueAlias}`);
            }
        });

        return filterExp.join(' and ');
    },

    _expAttrNameKey(key) {
        return '#' + key.toUpperCase();
    },

    _expAttrValueKey(key) {
        return ':' + key.toLowerCase();
    }
};