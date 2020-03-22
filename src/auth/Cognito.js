const AWS = require('aws-sdk');

module.exports = class Cognito {
    constructor(params = {}) {
        this._cognito = new AWS.CognitoIdentityServiceProvider(params);
    }

    async getUser(accessToken) {
        if (typeof accessToken !== 'string') {
            throw new TypeError('accessToken argument must be a string');
        }

        const data = await this._cognito.getUser({
            AccessToken: accessToken
        }).promise();

        const email = this._getEmailFromAttributes(data.UserAttributes);
        const id = this._getIDFromAttributes(data.UserAttributes);

        return {
            id,
            email,
            username: data.Username
        };
    }

    _getIDFromAttributes(attrs) {
        return this._getAttr('sub', attrs);
    }

    _getEmailFromAttributes(attrs) {
        return this._getAttr('email', attrs);
    }

    _getAttr(name, attrs) {
        for (const a of attrs) {
            if (a.Name === name) {
                return a.Value;
            }
        }

        return;
    }
};
