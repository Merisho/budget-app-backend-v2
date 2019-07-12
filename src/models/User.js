const BaseModel = require('./BaseModel');

module.exports = {
    init(storage) {
        return class User extends BaseModel.init(storage) {
            constructor(data) {
                super();

                this._id = data.id;
                this._login = data.login;
                this._email = data.email;
            }
        
            static async save(data) {
                if (!data || !data.login || !data.id) {
                    throw new Error('Login must be defined');
                }
        
                return super.save({
                    id: data.id,
                    login: data.login,
                    email: data.email
                });
            }

            static get entityName() {
                return 'user';
            }
        
            get id() {
                return this._id;
            }
        
            get login() {
                return this._login;
            }
        
            get email() {
                return this._email;
            }
        
            set login(val) {
                this._login = val;
            }
        
            set email(val) {
                this._email = val;
            }
        
            toJSON() {
                return {
                    id: this.id,
                    login: this.login,
                    email: this.email
                };
            }
        };
    }
};